import { Button, Tooltip } from "antd";
import { useState } from "react";
import { TaskType } from "@/types/midmType";

interface ToggleButtonGroupProps {
  tasks: TaskType[];
  onChange: (selected: TaskType | null) => void;
  messageChange: (message: string) => void;
}

interface ToggleButtonProps {
  task: TaskType;
  isActive: boolean;
  onClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  task,
  isActive,
  onClick,
}) => {
  return (
    <Tooltip title={task.example} placement="top">
      <Button
        type={isActive ? "primary" : "default"}
        onClick={onClick}
        disabled={task.disabled}
      >
        {task.title}
      </Button>
    </Tooltip>
  );
};

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  tasks,
  onChange,
  messageChange,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClick = (index: number, task: TaskType) => {
    const newIndex = selectedIndex === index ? null : index; // 같은 버튼 클릭 시 선택 해제
    setSelectedIndex(newIndex);
    onChange(newIndex !== null ? task : null); // 선택된 버튼 값 전달
    if (newIndex !== null) {
      messageChange(task.example);
    } else {
      messageChange("");
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {tasks.map((task, index) => (
        <ToggleButton
          key={index}
          task={task}
          isActive={selectedIndex === index}
          onClick={() => handleClick(index, task)}
        />
      ))}
    </div>
  );
};

export default ToggleButtonGroup;
