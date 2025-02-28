export const formatDateMMDDHH = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const formattedMinute = String(minute).padStart(2, "0");

  return month + "월" + day + "일 " + hour + ":" + formattedMinute;
};

export const formatDateTimeYYMMDDHHMMSS = (date: Date) => {
  const pad = (n: string) => n.padStart(2, "0");

  const formattedDateTime = `${date.getFullYear()}-${pad(
    String(date.getMonth() + 1)
  )}-${pad(String(date.getDate()))} ${pad(String(date.getHours()))}:${pad(
    String(date.getMinutes())
  )}:${pad(String(date.getSeconds()))}.${pad(
    String(date.getMilliseconds())
  ).padStart(3, "0")}`; // 여기서 변경했습니다.

  return formattedDateTime;
};
