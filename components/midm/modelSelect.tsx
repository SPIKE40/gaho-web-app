import React from "react";
import { Select, Space } from "antd";
import { fetchModelList } from "@/services/chatAPI";
import { useQuery } from "@tanstack/react-query";

const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};

const ModelSelect = () => {
  const { data } = useQuery({
    queryKey: ["modelList"], // 쿼리 키
    queryFn: fetchModelList, // 쿼리 함수
  });
  return (
    <Space wrap>
      <Select
        defaultValue="Midm-base"
        style={{ width: 120 }}
        onChange={handleChange}
        options={data?.map((model) => ({
          value: model.name, // 선택된 값으로 사용할 값
          label: model.name, // 화면에 표시될 라벨
        }))}
        // options={[
        //   { value: "Midm-pro", label: "Midm-pro" },
        //   { value: "Midm-base", label: "Midm-base" },
        //   { value: "Midm-mini", label: "Midm-mini" },
        // ]}
      />
    </Space>
  );
};

export default ModelSelect;
