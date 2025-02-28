"use client";
//import Navigation from "@/components/navigation";
import { Layout, ConfigProvider, Flex, Collapse } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import midmStyle from "../../styles/midm.module.css";
import { HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import { IoEllipse } from "react-icons/io5";
import { MessageText } from "@/components/midm/messageText";
import ModelSelect from "@/components/midm/modelSelect";
import {
  formatDateMMDDHH,
  formatDateTimeYYMMDDHHMMSS,
} from "@/components/midm/dateText";
import cn from "@/utils/cn";
import HistoryDrawer from "@/components/midm/historyDrawer";
import ToggleButtonGroup from "@/components/midm/toggleButton";
import { fetchMidmChat } from "@/services/chatAPI";
import uuid from "react-uuid";
import { MessageType } from "@/types/midmType";
import { TaskType, ChatResponseType } from "@/types/midmType";
import {
  failErrMessage,
  //emptyErrMessage,
  privacyErrMessage,
} from "../contants";
import { RESULTCODE_OK } from "../contants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UploadComponent from "@/components/midm/upload";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EmailProcessSteps from "@/components/midm/cotStep";

const USER = "user";
const ASSISTANT = "assistant";

const { Content, Footer } = Layout;

const queryClient = new QueryClient();

const themeConfig = {
  token: {
    colorBgContainer: "white",
    borderRadiusLG: 10,
  },
};

const Tasks: TaskType[] = [
  {
    key: "email",
    title: "이메일 작성",
    example: "제품보증서가 잘못 전달된 것에 대해 사과하는 메일써줘.",
    disabled: false,
  },
  {
    key: "script",
    title: "대본생성",
    example: "30대 남자와 아이가 놀이동산에 있는 대본 써줘.",
    disabled: false,
  },
  {
    key: "summation",
    title: "요약",
    example: "",
    disabled: true,
  },
  {
    key: "rag",
    title: "RAG",
    example: "",
    disabled: true,
  },
];

const MidmPage = () => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messageHistories, setMessageHistories] = useState<MessageType[]>([]);
  const [selectedValue, setSelectedValue] = useState<TaskType | null>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false); // 한글 입력 중인지 여부
  const [processCompleted, setProcessCompleted] = useState(false);

  // compositionstart 이벤트에서 한글 입력 시작 감지
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // compositionend 이벤트에서 한글 입력 끝난 것 감지
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  useEffect(() => {
    const header = document.querySelector(".ant-layout-header");
    const footer = document.querySelector(".ant-layout-footer");
    if (header) {
      const computedHeaderHeight = window.getComputedStyle(header).height;
      document.documentElement.style.setProperty(
        "--header-height",
        computedHeaderHeight
      );
    }
    if (footer) {
      const computedFooterHeight = window.getComputedStyle(footer).height;
      document.documentElement.style.setProperty(
        "--footer-height",
        computedFooterHeight
      );
    }
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "20px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [inputMessage, textAreaRef]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value); // 텍스트 상태를 업데이트
  };

  const handleSend = async () => {
    let chatId = uuid();
    const newMessages = [...messageHistories];
    newMessages.push({
      message: {
        role: USER,
        content: inputMessage,
      },
      transactionId: chatId,
      date: formatDateTimeYYMMDDHHMMSS(new Date()),
      resultCode: "xss_script",
      errorContent: "보안정책을 위반한 요청입니다.",
    });

    setMessageHistories(newMessages);
    setInputMessage("");

    const response = await fetchMidmChat(
      selectedValue ? selectedValue.key : "chat",
      chatId,
      newMessages
    );

    const handleOk = (responseJson: ChatResponseType) => {
      const resMessages = [...newMessages];
      chatId = responseJson.transactionId;

      const newMessage = {
        message: {
          role: ASSISTANT,
          content: responseJson.response,
        },
        transactionId: chatId,
        date: formatDateTimeYYMMDDHHMMSS(new Date()),
        //transactionId: responseJson.transactionId,
        resultCode: RESULTCODE_OK,
        cot: responseJson.cot,
      };
      resMessages.push(newMessage);
      console.log(resMessages);
      //resultMessages=resMessages
      setMessageHistories(resMessages);

      // if (responseJson.streamEnd) {
      //   let inputTokens = responseJson.inputTokens;
      //   let outputTokens = responseJson.outputTokens;
      //   if (inputTokens !== null && outputTokens !== null) {
      //     setTokens({
      //       inputTokens: responseJson.inputTokens,
      //       outputTokens: responseJson.outputTokens,
      //     });
      //   } else {
      //     if (!inputTokens) {
      //       setTokens({
      //         inputTokens: 0,
      //         outputTokens: responseJson.outputTokens,
      //       });
      //       if (!outputTokens) {
      //         setTokens({ inputTokens: 0, outputTokens: 0 });
      //       }
      //     } else {
      //       setTokens({
      //         inputTokens: responseJson.inputTokens,
      //         outputTokens: 0,
      //       });
      //     }
      //   }
      //   setShowToken(true);
      // }
    };

    const handleError = (responseJson: ChatResponseType, errorText: string) => {
      const errorHandledMessages = newMessages.map((messageHistory) => {
        // console.log(messageHistory.transactionId)
        if (messageHistory.transactionId == responseJson.transactionId) {
          messageHistory.resultCode = responseJson.resultCode;
          messageHistory.errorContent = errorText;
        }
        return messageHistory;
      });
      setMessageHistories(errorHandledMessages);
    };

    const handleResponse = (responseJson: ChatResponseType) => {
      if (responseJson?.response.length) {
        // 개인정보가 검출된 메세지 응답일 경우
        if (
          responseJson?.resultCode &&
          Number(responseJson?.resultCode) === 4222
        ) {
          const lastMessage = [...newMessages].pop();

          if (lastMessage?.message.role === "assistant") newMessages.pop();

          newMessages[newMessages?.length - 1] = {
            ...newMessages[newMessages?.length - 1],
            resultCode: responseJson?.resultCode,
            transactionId: responseJson.transactionId,
          };
          const resMessages = [...newMessages];
          setMessageHistories(resMessages);

          handleError(responseJson, privacyErrMessage);
        } else if (
          responseJson?.resultCode &&
          String(responseJson?.resultCode) !== "0000"
        ) {
          const lastMessage = [...newMessages].pop();

          if (lastMessage?.message.role === "assistant") newMessages.pop();

          newMessages[newMessages?.length - 1] = {
            ...newMessages[newMessages?.length - 1],
            resultCode: responseJson?.resultCode,
            transactionId: responseJson.transactionId,
          };
          const resMessages = [...newMessages];
          setMessageHistories(resMessages);

          handleError(responseJson, failErrMessage);
        } else {
          handleOk(responseJson);
        }
      }
      // if (
      //   responseJson.streamEnd === true ||
      //   responseJson.streamEnd === "true"
      // ) {
      //   if (isPrivacyMessage || isResultFailMessage) {
      //     setMessageHistories((prev: any) => {
      //       prev.pop();
      //       return prev;
      //     });
      //   }
      // }
    };

    handleResponse(response);
  };

  const handleEnter: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const keyboardEvent = e.nativeEvent as KeyboardEvent;
    if (keyboardEvent.key === "Enter" && keyboardEvent.shiftKey) {
      // Shift + Enter가 눌리면 줄바꿈을 수행
      return; // 아무 작업도 하지 않고 기본 동작을 허용 (줄바꿈)
    }

    if (keyboardEvent.key === "Enter" && !isComposing) {
      keyboardEvent.preventDefault(); // 기본 엔터키 동작 방지
      handleSend();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        {/* <Layout
          style={{ height: "100vh", display: "flex", flexDirection: "row" }}
        > */}
        {/* <Navigation></Navigation> */}
        {/* <Layout style={{ height: "100vh" }}> */}
        {/* <Header
            style={{
              padding: "0 16px",
              background: themeConfig.token.colorBgContainer,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <UserLogin />
          </Header> */}
        {/* 대화창 */}
        <Content
          style={{
            margin: "24px 16px 0",
          }}
        >
          <div
            className={midmStyle.playground}
            style={{
              padding: 24,
              minHeight: 360,
              background: themeConfig.token.colorBgContainer,
              borderRadius: themeConfig.token.borderRadiusLG,
              height: "100%",
            }}
          >
            {/* 대화 출력창 */}
            <div className="flex flex-col gap-2 h-3/4">
              <div className="flex flex-row gap-2">
                <ModelSelect />
                <HistoryDrawer />
              </div>
              <div className="flex h-3/4  overflow-auto gap-4 justify-center">
                <div className="flex flex-col w-full max-w-[768px] md:w-5/6 gap-4">
                  {messageHistories.length === 0 && (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <div className="relative flex h-[56px] w-[56px] scale-125 items-center justify-center">
                        <IoEllipse
                          className="absolute left-0 top-[10px] h-[56px] w-[56px]"
                          style={{ color: "#F6F7FB" }}
                        />
                        <HiChatBubbleLeftEllipsis className="absolute left-[16px] top-[26px] h-[24px] w-[24px]" />
                      </div>
                      <div className="h-6" />
                      <div className="text-sm leading-7 select-none text-[#313B49] hidden-chat-icon">
                        {"Chat Playground"}
                      </div>
                    </div>
                  )}
                  {messageHistories.map((messageHistory, index) => (
                    <div key={index}>
                      <div className="flex flex-row">
                        {messageHistory.message.role === USER && (
                          <div className="mx-2 mt-auto ml-auto text-xs text-gray-400 min-w-max">
                            {formatDateMMDDHH(new Date(messageHistory.date))}
                          </div>
                        )}
                        <MessageText
                          className={cn(
                            "border rounded-2xl w-fit py-2 px-7 max-w-[80%]",
                            messageHistory.message.role === ASSISTANT
                              ? midmStyle.assistanttext
                              : "",
                            messageHistory.message.role === USER
                              ? midmStyle.usertext
                              : ""
                          )}
                        >
                          <div className="flex flex-row items-center">
                            <div className="flex-grow" />
                          </div>
                          {messageHistory.cot ? (
                            processCompleted ? (
                              <div className="flex flex-col">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {messageHistory.message.content as string}
                                </ReactMarkdown>
                                <Collapse
                                  style={{ marginTop: "10px" }}
                                  size="small"
                                  items={[
                                    {
                                      key: "1",
                                      label: "사고 과정 보기",
                                      children: messageHistory.cot.map(
                                        (item, i) => (
                                          <li key={i.toString()}>
                                            <strong>
                                              {item.index}. {item.title}
                                            </strong>
                                            <p>{item.description}</p>
                                          </li>
                                        )
                                      ),
                                    },
                                  ]}
                                ></Collapse>
                              </div>
                            ) : (
                              <EmailProcessSteps
                                stepsData={messageHistory.cot}
                                setProcessCompleted={setProcessCompleted}
                              />
                            )
                          ) : (
                            <div>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {messageHistory.message.content as string}
                              </ReactMarkdown>
                            </div>
                          )}
                        </MessageText>
                        {messageHistory.message.role === "assistant" && (
                          <div className="mx-2 mt-auto mr-0 text-xs text-gray-400 min-w-max">
                            {formatDateMMDDHH(new Date(messageHistory.date))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* task 선택 */}
            <div className="my-2">
              <Flex gap="small" wrap style={{ justifyContent: "center" }}>
                <ToggleButtonGroup
                  tasks={Tasks}
                  onChange={setSelectedValue}
                  messageChange={setInputMessage}
                />
              </Flex>
            </div>
            {/* 메세지 입력 창 */}
            <div className="m-auto w-full max-w-[768px] md:w-5/6 my-5">
              <div className="flex w-full h-full flex-col-reverse">
                <div className={midmStyle.customContainer}>
                  <div className="h-full w-full">
                    <textarea
                      placeholder={
                        selectedValue
                          ? selectedValue.example
                          : "Enter your message.."
                      }
                      className={midmStyle.customTextarea}
                      rows={1}
                      style={{
                        resize: "none",
                        maxHeight: "150px",
                        overflow: "hidden",
                        height: "20px",
                        bottom: "20px",
                      }}
                      value={inputMessage}
                      onChange={handleChange}
                      contentEditable={true}
                      suppressContentEditableWarning
                      ref={textAreaRef}
                      onKeyDown={handleEnter}
                      onCompositionStart={handleCompositionStart} // 한글 입력 시작
                      onCompositionEnd={handleCompositionEnd} // 한글 입력 끝
                    ></textarea>
                    <div className="flex w-full items-center gap-2 py-2 overflow-auto justify-end " />
                    <div className="flex w-full justify-between">
                      <UploadComponent />
                      <Button
                        className="bg-gray-300 py-1 px-2 rounded-md text-sm"
                        onClick={handleSend}
                        disabled={inputMessage ? false : true}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Mi:dm can make mistakes. Please verify information.
        </Footer>
        {/* </Layout> */}
        {/* </Layout> */}
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default MidmPage;
