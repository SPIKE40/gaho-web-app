// src/components/DocumentViewerSection.js
import React from 'react';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const DocumentViewerSection = React.memo(({ selectedDocument }) => {
  console.log("DocumentViewerSection 렌더링"); // 렌더링 여부 확인용 로그

  if (!selectedDocument) {
    return <div className="no-document">문서를 선택해주세요.</div>;
  }

  return (
    <DocViewer
      documents={[selectedDocument]}
      pluginRenderers={DocViewerRenderers}
      style={{ width: "100%", height: "100%" }}
      disableAnalytics={true}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.selectedDocument === nextProps.selectedDocument;
});

DocumentViewerSection.displayName = "DocumentViewerSection"; // ✅ 추가
export default DocumentViewerSection;
