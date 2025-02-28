"use client"; // 👈 클라이언트 컴포넌트 선언

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-resizable/css/styles.css";
import "./page.css";
import "./assets/css/all.min.css";
import ErrorBoundary from "./components/ErrorBoundary";
import TextEditor from "./components/TextEditor";
import Tabs, { Tab } from "./components/Tabs";
import JSONViewer from "./components/JSONViewer";
import FileUploadSection from "./components/FileUploadSection";
import CategorySelector from "./components/CategorySelector";
import ImageViewerComponent from "./components/ImageViewerComponent";
import { AnalysisFilesDownloadFunction } from "./components/CommonFunctions";
import NoticePopup from "./components/NoticePopup";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import ReleaseNote from "./components/ReleaseNote";
import SampleJsonData from "./SamepleData.json";
import Image from "next/image";

// src/components/icons.js
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faArrowsRotate,
  faUndo,
  faRedo,
  faRocket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faArrowsRotate,
  faUndo,
  faRedo,
  faRocket,
  faSpinner
);

interface JsonData {
  uuid: string;
  docs: AnalyzedDoc[];
}

interface AnalyzedDoc {
  filename: string; // 파일명 (예: "일반전용회선.pfd")
  pages: AnalyzedPage[]; // 페이지 번호 배열 (예: [1])
  page_image_urls: { src: string; alt: string }[]; // 각 페이지의 이미지 URL 배열 (예: ["url1", "url2", ...])
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
  tables: {
    polygon: number[];
    cells: { polygon: number[]; content: string }[];
    html: string;
  }[];
  lines: { content: string; polygon: number[] }[];
}

function App() {
  const [lightMode, setLightMode] = useState(true);
  const editorRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedPolygon, setSelectedPolygon] = useState<null | undefined>(
    null
  );
  const [selectedClass, setselectedClass] = useState<string>(""); //주석 표현용
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [uploadedUUID, setUploadedUUID] = useState("");
  const uploadedUUIDRef = useRef(uploadedUUID);
  const [jsonRawData, setjsonRawData] = useState<JsonData>(SampleJsonData); // 서버로부터 받은 JSON 데이터
  const [selectedDocIndex, setSelectedDocIndex] = useState(0); // 추가된 상태
  // "Sample" 텍스트의 표시 여부를 관리하는 상태
  const [showSample, setShowSample] = useState(true);
  const [isGPUEnabled, setIsGPUEnabled] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState({
    seconds: 0,
    milliseconds: 0,
  });

  const [images, setImages] = useState([
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_2.jpg",
      alt: "페이지 1",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_5.jpg",
      alt: "이미지 2",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EB%A7%81%EA%B3%A0%EB%B9%84%EC%A6%88_%EC%86%8C%EA%B0%9C%EC%9E%90%EB%A3%8C_page_0.jpg",
      alt: "페이지 3",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_2.jpg",
      alt: "페이지 4",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_5.jpg",
      alt: "페이지 5",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EB%A7%81%EA%B3%A0%EB%B9%84%EC%A6%88_%EC%86%8C%EA%B0%9C%EC%9E%90%EB%A3%8C_page_0.jpg",
      alt: "페이지 6",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_2.jpg",
      alt: "페이지 7",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_5.jpg",
      alt: "페이지 8",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EB%A7%81%EA%B3%A0%EB%B9%84%EC%A6%88_%EC%86%8C%EA%B0%9C%EC%9E%90%EB%A3%8C_page_0.jpg",
      alt: "페이지 9",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_2.jpg",
      alt: "페이지 10",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_5.jpg",
      alt: "페이지 11",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EB%A7%81%EA%B3%A0%EB%B9%84%EC%A6%88_%EC%86%8C%EA%B0%9C%EC%9E%90%EB%A3%8C_page_0.jpg",
      alt: "페이지 12",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_2.jpg",
      alt: "페이지 13",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_5.jpg",
      alt: "페이지 14",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EB%A7%81%EA%B3%A0%EB%B9%84%EC%A6%88_%EC%86%8C%EA%B0%9C%EC%9E%90%EB%A3%8C_page_0.jpg",
      alt: "페이지 15",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_2.jpg",
      alt: "페이지 16",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_5.jpg",
      alt: "페이지 17",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EB%A7%81%EA%B3%A0%EB%B9%84%EC%A6%88_%EC%86%8C%EA%B0%9C%EC%9E%90%EB%A3%8C_page_0.jpg",
      alt: "페이지 18",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_2.jpg",
      alt: "페이지 19",
    },
    {
      src: "https://sshj.s3.ap-northeast-2.amazonaws.com/club/%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83+%EB%B6%84%EC%84%9D+%EC%9D%B4%EB%AF%B8%EC%A7%80/KT+%EA%B5%AD%EB%82%B4%EC%A0%84%EC%9A%A9%ED%9A%8C%EC%84%A0_%EB%B8%8C%EB%A1%9C%EC%8A%88%EC%96%B4_page_5.jpg",
      alt: "페이지 20",
    },
  ]); //샘플 페이지(asd)

  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
  }, [lightMode]);

  useEffect(() => {
    if (
      !(
        jsonRawData &&
        Array.isArray(jsonRawData.docs) &&
        jsonRawData.docs.length > selectedDocIndex &&
        selectedDocIndex >= 0 &&
        Array.isArray(jsonRawData.docs[selectedDocIndex].pages) &&
        jsonRawData.docs[selectedDocIndex].pages.length > selectedPageIndex &&
        selectedPageIndex >= 0
      )
    ) {
      setjsonRawData(SampleJsonData); // 조건이 충족되지 않을 경우 null로 설정
    }
  }, [jsonRawData, selectedPageIndex, selectedDocIndex]);

  // 새로운 useEffect 추가: selectedDocIndex 또는 selectedImgIndex가 변경될 때 이미지 업데이트
  useEffect(() => {
    if (jsonRawData && jsonRawData.docs.length > selectedDocIndex) {
      const selectedDoc = jsonRawData.docs[selectedDocIndex];
      if (selectedDoc && selectedDoc.page_image_urls) {
        setImages(selectedDoc.page_image_urls);
      } else {
        setImages([]); // 이미지가 없을 경우 빈 배열로 설정
      }
    }
  }, [jsonRawData, selectedDocIndex]);

  const toggleLightMode = useCallback(() => {
    setLightMode((prevMode) => !prevMode);
  }, []);

  const handleFileUploaded = useCallback((uuid: string) => {
    console.log("Received UUID in App:", uuid); // UUID 출력
    setUploadedUUID(uuid); // UUID 상태 업데이트
    uploadedUUIDRef.current = uuid;
    console.log("Setup UUID in App:", uploadedUUIDRef.current);
  }, []);

  const [isReleaseNoteOpen, setIsReleaseNoteOpen] = useState(false);

  const openReleaseNote = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // 기본 링크 동작 방지
    setIsReleaseNoteOpen(true);
  };

  const closeReleaseNote = () => {
    setIsReleaseNoteOpen(false);
  };

  const handleSelectDocument = useCallback(
    (file: File) => {
      // if (!file) {
      //   setSelectedDocument(null);
      //   return;
      // }
      // const docType = file.type;
      // let fileType = 'docx';
      // if (docType.includes('pdf')) fileType = 'pdf';
      // else if (docType.includes('word')) fileType = 'docx';
      // else if (docType.includes('excel')) fileType = 'xlsx';
      // else if (docType.includes('powerpoint')) fileType = 'pptx';
      // else fileType = 'docx';

      // setSelectedDocument({
      //   uri: URL.createObjectURL(file),
      //   fileType,
      //   fileName: file.name,
      // });

      // // Check if jsonRawData and jsonRawData.docs are valid
      // if (!jsonRawData || !Array.isArray(jsonRawData.docs)) {
      //   console.error("유효한 jsonRawData.docs 배열이 아닙니다.");
      //   console.error("jsonRawData:", jsonRawData);
      //   alert("문서 업로드 후 분석이 완료되지 않았거나 데이터가 없는 경우입니다. 다시 시도 하세요.");
      //   return;
      // }

      const index = jsonRawData.docs.findIndex(
        (doc) => doc.filename === file?.name
      );
      if (index === -1) {
        console.error("선택한 문서가 jsonRawData.docs에 존재하지 않습니다.");
        alert("처리되지 않은 문서입니다. 업로드 하여 분석을 수행하세요");
        return;
      }
      setSelectedPageIndex(0);
      setSelectedDocIndex(index);
    },
    [jsonRawData]
  );

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsGPUEnabled(event.target.checked);
  };

  // useCallback으로 handleExtractButtonClick을 메모이제이션하여 재사용
  const handleRunAnalysisButtonClick = useCallback(async () => {
    setIsLoading(true);

    //수행시간 측정
    setIsRunning(true);
    setExecutionTime({ seconds: 0, milliseconds: 0 });

    // Start the timer
    const startTime = performance.now();
    const interval = setInterval(() => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const seconds = Math.floor(elapsed / 1000);
      const milliseconds = Math.floor((elapsed % 1000) / 10);
      setExecutionTime({ seconds, milliseconds });
    }, 10); // Update every 10 milliseconds

    try {
      const uuid_local = uploadedUUIDRef.current;
      const docItems = {
        uuid: uuid_local,
        docs: [] as AnalyzedDoc[],
      };

      const urlResponse = await AnalysisFilesDownloadFunction({
        uuid: uuid_local,
        gpuOn: isGPUEnabled,
      });
      const fetchPromiss = urlResponse.urls.map(async (url: string) => {
        const fileResponse = await fetch(url);
        const analyzedDoc = await fileResponse.json();
        docItems.docs.push(analyzedDoc);
      });
      await Promise.all(fetchPromiss);

      const processedOutput: JsonData = {
        ...docItems,
        docs: docItems.docs.map((doc) => ({
          ...doc,
          page_image_urls: doc.page_image_urls.map((img, idx_img) => ({
            src: img.src,
            alt: `이미지 ${idx_img + 1}`,
          })),
        })),
      };

      // 상태 업데이트
      setjsonRawData(processedOutput);

      // 첫 번째 문서의 페이지 이미지 URL을 설정
      if (processedOutput.docs.length > 0) {
        setImages(processedOutput.docs[0].page_image_urls);
      }

      console.log("AI 분석 완료");

      // 기본 선택 인덱스를 0으로 설정하여 첫 번째 페이지 선택
      setSelectedPageIndex(0);

      //Sample글자 지우기
      setShowSample(false);
    } catch (error) {
      console.error("AI 분석 중 오류 발생:", error);
      // 추가적인 오류 처리 로직을 여기에 작성
    } finally {
      // Stop the timer
      clearInterval(interval);
      setIsRunning(false);
      setIsLoading(false);
    }
  }, [isGPUEnabled]);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const createDocumentIconsForWatermark = useCallback((panelName: string) => {
    const iconContainer = document.querySelector(`.${panelName}`);
    if (!iconContainer) return;
    const icons = [
      "fa-file-alt",
      "fa-file-pdf",
      "fa-file-word",
      "fa-file-excel",
      "fa-file-powerpoint",
      "fa-file-image",
      "fa-file-code",
    ];

    // 아이콘을 점진적으로 생성하기 위한 함수
    const createIcon = () => {
      const icon = document.createElement("i");
      icon.classList.add(
        "fas",
        icons[Math.floor(Math.random() * icons.length)],
        "document-icon"
      );
      icon.style.left = `${Math.random() * 90}vw`;
      icon.style.top = `${Math.random() * 90}vh`;
      icon.style.animationDuration = `${10 + Math.random() * 5}s`; // CSS 애니메이션과 일치 또는 조정
      icon.style.animationDelay = `${Math.random() * 5}s`;

      // 애니메이션이 끝나면 아이콘을 제거
      icon.addEventListener("animationend", () => {
        if (iconContainer.contains(icon)) {
          iconContainer.removeChild(icon);
        }
      });

      iconContainer.appendChild(icon);
    };

    // 아이콘 생성, 각 아이콘 생성 간에 700ms 간격을 둠
    for (let i = 0; i < 1; i++) {
      const timeout = setTimeout(createIcon, i * 5000); // 700ms 간격으로 아이콘 생성
      timeoutsRef.current.push(timeout);
    }
  }, []);

  // 아이콘 생성 시작 함수
  const startIconCreation = useCallback(() => {
    const panelName = "transform-wrapper"; // 아이콘을 추가할 컨테이너 클래스 이름
    createDocumentIconsForWatermark(panelName);

    // 이후 5초마다 아이콘 생성
    intervalRef.current = setInterval(() => {
      createDocumentIconsForWatermark(panelName);
    }, 50000); // 5초마다 아이콘 생성
  }, [createDocumentIconsForWatermark]);

  // 아이콘 생성 중지 함수
  const stopIconCreation = useCallback(() => {
    // 모든 setTimeout을 취소
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];

    // setInterval 취소
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 가시성 변경 핸들러
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      startIconCreation();
    } else {
      stopIconCreation();
    }
  }, [startIconCreation, stopIconCreation]);

  // useEffect를 이용하여 가시성 변경 이벤트 리스너 추가 및 초기 상태 설정
  useEffect(() => {
    // 가시성 변경 이벤트 리스너 추가
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 초기 상태에 따라 아이콘 생성 여부 결정
    if (document.visibilityState === "visible") {
      startIconCreation();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopIconCreation();
    };
  }, [handleVisibilityChange, startIconCreation, stopIconCreation]);

  const handleClearPolygon = () => {
    setSelectedPolygon(null);
  };

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // 브라우저에서 기본 다이얼로그를 보여주기 위해서 메시지를 설정
    event.preventDefault();
    event.returnValue = ""; // 이 값을 설정해야 경고 메시지가 표시됩니다.

    const sendCloseToServer = async () => {
      const url = process.env.REACT_APP_URL_AGENT + "/close";
      const formData = new FormData();
      formData.append("uuid", uploadedUUIDRef.current);
      navigator.sendBeacon(url, formData);
    };
    sendCloseToServer();
  };

  useEffect(() => {
    // beforeunload 이벤트 리스너 추가
    window.addEventListener("beforeunload", handleBeforeUnload);
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className={`App ${lightMode ? "light-mode" : ""}`}>
      <NoticePopup />
      <div className="top-panel">
        <h1>Docu See</h1>
        <div className="flex flex-row h-full items-center">
          <div className="top-menu">
            <p>
              <a href="https://docai-agent-bwdmaafmhrb4gka9.koreacentral-01.azurewebsites.net/docs">
                APIs
              </a>{" "}
              |
              <a
                href="/ReleaseNote"
                className="release-note-link"
                onClick={openReleaseNote}
              >
                Release Note
              </a>{" "}
              |
              <a href="https://jira.dspace.kt.co.kr/issues/?jql=project%20%3D%20DOCAISOL%20AND%20issuetype%20in%20(Bug%2C%20VoC)%20AND%20resolution%20%3D%20Unresolved%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC">
                Feedback
              </a>
            </p>
            {isReleaseNoteOpen && <ReleaseNote onClose={closeReleaseNote} />}
          </div>

          <button id="mode-toggle" onClick={toggleLightMode} className="">
            <i className={`fas ${lightMode ? "fa-sun" : "fa-moon"}`}></i>
          </button>
        </div>
      </div>

      <div className="button-panel">
        <div className="button-container">
          <label className="gpu-label">
            <input
              type="checkbox"
              className="gpu-checkbox"
              checked={isGPUEnabled}
              onChange={handleCheckboxChange}
            />
            Use GPU
          </label>
          <button
            id="run-analysis"
            onClick={handleRunAnalysisButtonClick}
            className="run-analysis"
            disabled={isLoading}
            title="문서분석 발사버튼: AI가 업로드한 문서분석을 시작"
          >
            <FontAwesomeIcon
              icon={isLoading ? "spinner" : "rocket"}
              spin={isLoading}
              style={{ marginRight: "8px" }}
            />
            {isLoading ? "Analyzing..." : "Run analysis"}
          </button>
          <span id="execution-time">
            {isRunning
              ? `Elapsed Time: ${String(executionTime.seconds).padStart(
                  2,
                  "0"
                )}s ${String(executionTime.milliseconds).padStart(2, "0")}ms`
              : `Execution Time: ${String(executionTime.seconds).padStart(
                  2,
                  "0"
                )}s ${String(executionTime.milliseconds).padStart(2, "0")}ms`}
          </span>
        </div>

        <CategorySelector
          selectedMainCategory={selectedMainCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedMainCategory={setSelectedMainCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          jsonData={
            jsonRawData?.docs?.[selectedDocIndex]?.pages?.[selectedPageIndex]
              ?.analyzeResult || ""
          }
        />
      </div>

      <div className="main-content">
        <div className="left-panel">
          <FileUploadSection
            onSelectImage={setSelectedImage}
            onSelectDocument={handleSelectDocument}
            maxFiles={10}
            onFileUpload={handleFileUploaded}
            disabled={!jsonRawData || !Array.isArray(jsonRawData.docs)}
          />
        </div>

        <div className="center-panel">
          <ImageViewerComponent
            images={images}
            selectedPageIndex={selectedPageIndex} // 현재 선택된 이미지 인덱스 전달
            setSelectedPageIndex={setSelectedPageIndex} // 이미지 인덱스를 업데이트하는 함수 전달
            selectedPolygon={selectedPolygon}
            selectedClass={selectedClass}
            onClearPolygon={handleClearPolygon}
            showSample={showSample} // "Sample" 표시 여부 전달
          />
        </div>

        <div className="right-panel">
          <Tabs>
            <Tab label="Content">
              <JSONViewer
                data={jsonRawData ? jsonRawData : ""}
                selectedDocIndex={selectedDocIndex}
                selectedPageIndex={selectedPageIndex}
                setData={setjsonRawData}
                onPolygonSelect={setSelectedPolygon}
                onClassSelect={setselectedClass}
              />
            </Tab>
            <Tab label="HTML">
              <ErrorBoundary>
                <TextEditor
                  ref={editorRef}
                  data={
                    typeof jsonRawData === "string"
                      ? JSON.parse(jsonRawData)
                      : jsonRawData || {}
                  }
                  selectedDocIndex={selectedDocIndex}
                  selectedPageIndex={selectedPageIndex}
                  type="html"
                />
              </ErrorBoundary>
            </Tab>
            <Tab label="MarkDown">
              <ErrorBoundary>
                <TextEditor
                  ref={editorRef}
                  data={
                    typeof jsonRawData === "string"
                      ? JSON.parse(jsonRawData)
                      : jsonRawData || {}
                  }
                  selectedDocIndex={selectedDocIndex}
                  selectedPageIndex={selectedPageIndex}
                  type="markdown"
                />
              </ErrorBoundary>
            </Tab>
            <Tab label="JSON">
              <JsonView
                src={
                  jsonRawData?.docs?.[selectedDocIndex]?.pages?.[
                    selectedPageIndex
                  ]?.analyzeResult || {}
                }
                editable={true}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
      <div className="corp_area">
        <p>
          <a href="/terms">이용약관</a> |<a href="/privacy">개인정보처리방침</a>{" "}
          | ⓒ KT Corp.
        </p>
      </div>

      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage("")}>
          <Image src={selectedImage} alt="Selected" />
        </div>
      )}
      <div className="document-icons"></div>
    </div>
  );
}

export default App;
