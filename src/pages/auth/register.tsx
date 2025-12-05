import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PocketBase from "pocketbase";
import { config } from "../../config/env";

const { Title, Text } = Typography;

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const pb = new PocketBase(config.pocketbaseUrl);

      // 사용자 생성 (verified: false로 생성)
      await pb.collection("users").create({
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
        name: values.name,
        verified: false, // 슈퍼유저가 승인해야 true가 됨
      });

      message.success("회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.");
      navigate("/login");
    } catch (error: any) {
      console.error("회원가입 실패:", error);

      let errorMessage = "회원가입에 실패했습니다.";
      if (error?.data?.data) {
        const fieldErrors = error.data.data;
        const errorMessages: string[] = [];
        for (const [field, err] of Object.entries(fieldErrors) as [string, any][]) {
          let fieldName = field;
          if (field === "email") fieldName = "이메일";
          if (field === "password") fieldName = "비밀번호";
          if (field === "name") fieldName = "이름";
          let errMsg = err.message || err.code;
          if (err.code === "validation_not_unique") {
            errMsg = "이미 사용 중입니다.";
          }
          errorMessages.push(`${fieldName}: ${errMsg}`);
        }
        errorMessage = errorMessages.join("\n");
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>라이프마스터리스쿨</Title>
          <Text type="secondary">관리자 회원가입</Text>
        </div>

        <Form
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "이름을 입력해주세요" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="이름"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "이메일을 입력해주세요" },
              { type: "email", message: "올바른 이메일 형식이 아닙니다" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="이메일"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "비밀번호를 입력해주세요" },
              { min: 8, message: "비밀번호는 8자 이상이어야 합니다" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="passwordConfirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "비밀번호 확인을 입력해주세요" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("비밀번호가 일치하지 않습니다"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호 확인"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              회원가입
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              이미 계정이 있으신가요?{" "}
              <Link to="/login">로그인</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};
