"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
import '@toast-ui/editor/dist/toastui-editor.css';
import './TextEditor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

interface JsonData {
  uuid: string;
  docs: AnalyzedDoc[];
}

interface AnalyzedDoc {
  filename: string;           // 파일명 (예: "일반전용회선.pfd")
  pages: AnalyzedPage[];            // 페이지 번호 배열 (예: [1])
  page_image_urls: { src: string; alt: string }[];  // 각 페이지의 이미지 URL 배열 (예: ["url1", "url2", ...])
}

interface AnalyzedPage {
  status: string;
  createdDataTime: string;
  lastUpdatedDateTime: string;
  analyzeResult: AnalyzeResult; // 이 속성이 있어야 함
  figure_image_urls: string[];
}

interface AnalyzeResult {
  content: string;
  markdown: string;
  width: number;
  height: number;
  unit: string;
  paragraphs: { content: string; polygon: number[]; class: string }[];
  tables: { polygon: number[]; cells: { polygon: number[]; content: string }[]; html: string }[];
  lines: { content: string; polygon: number[] }[];
}

// 동적으로 Editor 컴포넌트 가져오기
const EditorComponent = dynamic(() => import("@toast-ui/react-editor").then((mod) => mod.Editor), {
  ssr: false,
});

// Editor 타입 정의 가져오기
import { Editor } from '@toast-ui/react-editor';

// ref를 통해 노출할 메서드의 인터페이스
interface TextEditorRef {
  getInstance: () => ReturnType<InstanceType<typeof Editor>['getInstance']>;
}

const TextEditor = React.forwardRef(
  (
    { data, selectedDocIndex, selectedPageIndex, type }: {
      data: JsonData;
      selectedDocIndex: number;
      selectedPageIndex: number;
      type: string;
    },
    ref: React.Ref<TextEditorRef>
  ) => {
    const editorRef = useRef<InstanceType<typeof Editor> | null>(null);

    useImperativeHandle(ref, () => ({
      getInstance: () => editorRef.current?.getInstance(),
    }));

    useEffect(() => {
      if (editorRef.current) {
        const editorInstance = editorRef.current.getInstance();
        if (type === 'html') {
          if (data) {
            if (
              data?.docs?.[selectedDocIndex]?.pages?.[selectedPageIndex]?.analyzeResult?.content
            ) {
              editorInstance.setHTML(
                data.docs[selectedDocIndex].pages[selectedPageIndex].analyzeResult.content
              );
            } else {
              editorInstance.setHTML("<p>No content available</p>");
            }
          } else {
            editorInstance.setHTML('<p>there is nothing for rendering</p>');
          }
        } else if (type === 'markdown') {
          if (data) {
            if (
              data?.docs?.[selectedDocIndex]?.pages?.[selectedPageIndex]?.analyzeResult?.markdown
            ) {
              editorInstance.setMarkdown(
                data.docs[selectedDocIndex].pages[selectedPageIndex].analyzeResult.markdown
              );
            } else {
              editorInstance.setMarkdown("# No content available");
            }
          } else {
            editorInstance.setMarkdown('# there is nothing for rendering');
          }
        }
      }
    }, [data, type, selectedDocIndex, selectedPageIndex]);

    const handleDownload = () => {
      if (!editorRef.current) return;

      const editorInstance = editorRef.current.getInstance();
      let content = '';
      let mimeType = '';
      let fileExtension = '';

      if (type === 'html') {
        content = editorInstance.getHTML();
        mimeType = 'text/html;charset=utf-8;';
        fileExtension = 'html';
      } else if (type === 'markdown') {
        content = editorInstance.getMarkdown();
        mimeType = 'text/markdown;charset=utf-8;';
        fileExtension = 'md';
      } else {
        content = editorInstance.getMarkdown() || editorInstance.getHTML();
        mimeType = 'text/plain;charset=utf-8;';
        fileExtension = 'txt';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `document-${timestamp}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const initialEditType = type === 'markdown' ? 'markdown' : 'wysiwyg';

    return (
      <div className="text-editor-container" style={{ height: '100%' }}>
        <div className="download-button-container">
          <button
            className="download-button"
            onClick={handleDownload}
            title={
              type === 'html'
                ? '내 컴퓨터의 다운로드 폴더에 HTML을 내려받음'
                : '내 컴퓨터의 다운로드 폴더에 Markdown을 내려받음'
            }
          >
            <FontAwesomeIcon icon={faDownload} />{' '}
            {type === 'html' ? 'HTML' : type === 'markdown' ? 'MarkDown' : 'Download'}
          </button>
        </div>
        {EditorComponent && (
          <EditorComponent
            ref={editorRef}
            height="100%"
            initialEditType={initialEditType}
            previewStyle="vertical"
            initialValue=""
            plugins={[tableMergedCell]}
          />
        )}
      </div>
    );
  }
);

TextEditor.displayName = "TextEditor";

export default TextEditor;