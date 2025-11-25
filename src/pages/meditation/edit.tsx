import { Edit } from "@refinedev/antd";
import { Form, Input, DatePicker, InputNumber, Select } from "antd";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const MeditationEdit = () => {
  return (
    <Edit saveButtonProps={{ children: "저장" }}>
      <Form layout="vertical">
        <Form.Item
          label="챌린지명"
          name="name"
          rules={[{ required: true, message: "챌린지명을 입력해주세요" }]}
        >
          <Input placeholder="예: 명상 바디더블링 2기" />
        </Form.Item>

        <Form.Item
          label="기간"
          name="period"
          rules={[{ required: true, message: "기간을 선택해주세요" }]}
        >
          <RangePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="가격"
          name="price"
          rules={[{ required: true, message: "가격을 입력해주세요" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            addonAfter="원"
          />
        </Form.Item>

        <Form.Item
          label="상태"
          name="status"
        >
          <Select>
            <Select.Option value="planned">예정</Select.Option>
            <Select.Option value="ongoing">진행중</Select.Option>
            <Select.Option value="completed">완료</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="설명" name="description">
          <TextArea
            rows={4}
            placeholder="#시작으로 명상을 시작하고, #종료로 명상을 종료하는 챌린지입니다."
          />
        </Form.Item>

        <Form.Item
          label="디스코드 카테고리 ID"
          name="discordCategoryId"
        >
          <Input placeholder="디스코드 카테고리 ID를 입력하세요" />
        </Form.Item>

        <Form.Item
          label="디스코드 채널 ID"
          name="discordChannelId"
        >
          <Input placeholder="디스코드 채널 ID를 입력하세요" />
        </Form.Item>
      </Form>
    </Edit>
  );
};
