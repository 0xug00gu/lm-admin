import { Create, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, InputNumber, Select } from "antd";

const { TextArea } = Input;

export const ManualSaleAdd = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps} title="수동 매출 추가">
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="날짜"
          name="date"
          rules={[{ required: true, message: "날짜를 선택해주세요" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="상품명"
          name="productName"
          rules={[{ required: true, message: "상품명을 입력해주세요" }]}
        >
          <Input placeholder="상품명을 입력하세요" />
        </Form.Item>

        <Form.Item
          label="구매자"
          name="buyer"
          rules={[{ required: true, message: "구매자를 입력해주세요" }]}
        >
          <Input placeholder="구매자 이름을 입력하세요" />
        </Form.Item>

        <Form.Item
          label="금액"
          name="amount"
          rules={[{ required: true, message: "금액을 입력해주세요" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="금액을 입력하세요"
            min={0}
            formatter={(value) => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>

        <Form.Item
          label="결제수단"
          name="paymentMethod"
          rules={[{ required: true, message: "결제수단을 선택해주세요" }]}
        >
          <Select
            placeholder="결제수단을 선택하세요"
            options={[
              { value: "card", label: "카드" },
              { value: "bank", label: "계좌이체" },
              { value: "cash", label: "현금" },
            ]}
          />
        </Form.Item>

        <Form.Item label="메모" name="memo">
          <TextArea rows={4} placeholder="메모를 입력하세요" />
        </Form.Item>
      </Form>
    </Create>
  );
};
