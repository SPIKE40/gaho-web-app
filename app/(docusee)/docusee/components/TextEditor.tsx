"use client";

import React, { useEffect, useImperativeHandle, useState } from "react";
import "./TextEditor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

interface JsonData {
  uuid: string;
  docs: AnalyzedDoc[];
}

interface AnalyzedDoc {
  filename: string;
  pages: AnalyzedPage[];
  page_image_urls: { src: string; alt: string }[];
}

interface AnalyzedPage {
  status: string;
  createdDataTime: string;
  lastUpdatedDateTime: string;
  analyzeResult: AnalyzeResult;
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

// ref를 통해 노출할 메서드의 인터페이스
interface TextEditorRef {
  getContent: () => string;
}

const TextEditor = React.forwardRef(
  (
    { data, selectedDocIndex, selectedPageIndex, type }: 
    { data: JsonData; selectedDocIndex: number; selectedPageIndex: number; type: string },
    ref: React.Ref<TextEditorRef>
  ) => {
    const [content, setContent] = useState("");

    useImperativeHandle(ref, () => ({
      getContent: () => content,
    }));

    useEffect(() => {
      let newContent = "";

      if (type === "html") {
        newContent = data?.docs?.[selectedDocIndex]?.pages?.[selectedPageIndex]?.analyzeResult?.content || "<p>No content available</p>";
      } else if (type === "markdown") {
        newContent = data?.docs?.[selectedDocIndex]?.pages?.[selectedPageIndex]?.analyzeResult?.markdown || "# No content available";
      }

      setContent(newContent);
    }, [data, type, selectedDocIndex, selectedPageIndex]);

    const handleDownload = () => {
      const blob = new Blob([content], { type: type === "html" ? "text/html" : "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `document-${timestamp}.${type === "html" ? "html" : "md"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    return (
      <div className="text-editor-container" style={{ height: "100%" }}>
        <div className="download-button-container">
          <button className="download-button" onClick={handleDownload} title="내 컴퓨터에 파일 저장">
            <FontAwesomeIcon icon={faDownload} /> {type === "html" ? "HTML" : "Markdown"} Download
          </button>
        </div>
        <textarea
          className="custom-textarea"
          style={{ width: "100%", height: "100%" }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    );
  }
);

TextEditor.displayName = "TextEditor";

export default TextEditor;
