import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Switch, InputNumber } from "antd";

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "discord_users",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="디스코드 ID"
          name="discord_id"
          rules={[
            {
              required: true,
              message: "디스코드 ID를 입력해주세요",
            },
          ]}
        >
          <Input placeholder="디스코드 ID를 입력하세요" />
        </Form.Item>

        <Form.Item
          label="사용자명"
          name="username"
          rules={[
            {
              required: true,
              message: "사용자명을 입력해주세요",
            },
          ]}
        >
          <Input placeholder="사용자명을 입력하세요" />
        </Form.Item>

        <Form.Item label="이름" name="name">
          <Input placeholder="이름을 입력하세요" />
        </Form.Item>

        <Form.Item
          label="이메일"
          name="email"
          rules={[
            {
              type: "email",
              message: "올바른 이메일 형식이 아닙니다",
            },
          ]}
        >
          <Input placeholder="이메일을 입력하세요" />
        </Form.Item>

        <Form.Item label="전화번호" name="phone">
          <InputNumber
            placeholder="전화번호를 입력하세요"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="현재 채널 ID" name="current_channel_id">
          <Input placeholder="현재 채널 ID를 입력하세요" />
        </Form.Item>

        <Form.Item label="원래 채널 ID" name="original_channel_id">
          <Input placeholder="원래 채널 ID를 입력하세요" />
        </Form.Item>

        <Form.Item label="카테고리 ID" name="category_id">
          <Input placeholder="카테고리 ID를 입력하세요" />
        </Form.Item>

        <Form.Item label="챌린지명" name="challenge_name">
          <Input placeholder="챌린지명을 입력하세요" />
        </Form.Item>

        <Form.Item
          label="부활방 여부"
          name="is_in_revival_room"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="휴식방 여부"
          name="is_in_rest_room"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="활성 상태"
          name="is_active"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
