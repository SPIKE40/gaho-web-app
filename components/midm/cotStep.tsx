import { useState, useEffect } from "react";
import { Steps, Row } from "antd";
import "../../styles/midm.module.css";
import { CotType } from "@/types/midmType";

interface EmailProcessStepsProps {
  stepsData: CotType[]; // stepsData를 외부에서 받음
  setProcessCompleted: (completed: boolean) => void; // 상태 업데이트 함수 전달
}

export const { Step } = Steps;

const EmailProcessSteps: React.FC<EmailProcessStepsProps> = ({
  stepsData,
  setProcessCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // 각 단계가 끝날 때마다 그 다음 단계로 넘어가는 기능
  useEffect(() => {
    if (currentStep < stepsData.length) {
      const timeoutId = setTimeout(() => {
        setCurrentStep((prevStep) => prevStep + 1);
      }, 3000); // 각 단계마다 3초 대기 (3초 후에 다음 단계로 이동)

      return () => clearTimeout(timeoutId); // 타이머 정리
    } else {
      // 모든 과정이 완료되었으면 이메일 결과 표시
      setProcessCompleted(true);
    }
  }, [currentStep, stepsData.length, setProcessCompleted]);

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16}>
        <Steps
          current={currentStep}
          direction="vertical" // 세로 방향으로 단계 표시
          style={{ marginBottom: "20px", position: "relative" }}
        >
          {stepsData.slice(0, currentStep + 1).map((step) => (
            <Step
              key={step.index}
              title={step.title}
              description={step.description}
              className={
                currentStep >= step.index ? "completed" : "in-progress"
              } // 완료된 단계와 진행 중인 단계를 구분
            />
          ))}
        </Steps>
      </Row>
    </div>
  );
};

export default EmailProcessSteps;
