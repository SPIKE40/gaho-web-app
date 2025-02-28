import { ReactNode } from "react";

export type ModelType = {
  name: string;
};

export type TaskType = {
  key: string;
  title: string;
  example: string;
  disabled: boolean;
};

export type MessageType = {
  message: {
    role: string;
    content: string;
  };
  transactionId: string;
  date: string;
  resultCode: string;
  errorContent?: string;
  cot?: CotType[];
};

export type CotType = {
  index: number;
  title: string;
  description: string;
};

export type ChatResponseType = {
  transactionId: string;
  cot?: CotType[];
  response: string;
  resultCode: string;
  //streamEnd: boolean;
};

export type VariantType =
  | "default"
  | "title"
  | "large"
  | "heading"
  | "medium"
  | "muted";

export type MyComponentProps = {
  children: ReactNode;
  className?: string; // className은 선택적 속성으로 만듦
  variant?: VariantType;
};
