import { MIDM_API_URL } from "@/app/contants";
import { MessageType } from "@/types/midmType";
import { ModelType } from "@/types/midmType";

//모델 리스트
export const fetchModelList = async (): Promise<ModelType[]> => {
  //return [{ name: "Midm-pro" }, { name: "Midm-base" }, { name: "Midm-mini" }];

  return await fetch(`${MIDM_API_URL}/getModel.json`, {
    method: "GET",
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: "Bearer " + localStorage.getItem("accessToken"),
    // },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.log("error on getting models" + error.response);
    });
};

//믿음 일반 채팅 & 이메일 채팅 & 대본 생성
export const fetchMidmChat = async (
  task: string,
  transaction_id: string,
  messages: MessageType[]
) => {
  if (typeof window !== "undefined") {
    return await fetch(`${MIDM_API_URL}/${task}.json`, {
      method: "GET",
      // 실제 API는 아래 POST로 호출
      // method: "POST",
      // headers: {
      //   "Content-Type": "application/json",
      //   Authorization: "Bearer " + localStorage.getItem("accessToken"),
      // },
      // body: JSON.stringify({
      //   transaction_id: transaction_id,
      //   messages: messages,
      // }),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.log("error on getting chat response " + error.response);
      });
  }
};

// export const fetchMidmChat = async (
//   task: string,
//   transaction_id: string,
//   messages: MessageType[],
//   selectmodel: string,
//   modelparameter: number,
//   streamYN: boolean
// ) => {
//   if (typeof window !== "undefined") {
//     return await fetch(`http://127.0.0.1:8000/api/chat/completions`, {
//       // 실제 API는 아래 POST로 호출
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("accessToken"),
//       },
//       body: JSON.stringify({
//         messages: messages,
//         model: selectmodel,
//         temperature: modelparameter,
//         stream: streamYN,
//       }),
//     })
//       .then((response) => response.json())
//       .catch((error) => {
//         console.log("error on getting chat response " + error.response);
//       });
//   }
// };
