import { Form, Input, Button, Card, Typography, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PocketBase from "pocketbase";
import { config } from "../../config/env";

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const pb = new PocketBase(config.pocketbaseUrl);

      // 로그인 시도
      const authData = await pb.collection("users").authWithPassword(
        values.email,
        values.password
      );

      // verified가 false면 승인 대기 페이지로
      if (!authData.record.verified) {
        // 로그아웃 처리 (토큰은 저장하되 verified 상태 저장)
        localStorage.setItem("pb_auth", JSON.stringify({
          token: pb.authStore.token,
          model: authData.record,
        }));
        navigate("/pending-approval");
        return;
      }

      // 인증된 사용자는 토큰 저장 후 대시보드로
      localStorage.setItem("pb_auth", JSON.stringify({
        token: pb.authStore.token,
        model: authData.record,
      }));

      message.success("로그인 성공!");
      navigate("/");
    } catch (error: any) {
      console.error("로그인 실패:", error);

      let errorMessage = "로그인에 실패했습니다.";
      if (error?.message) {
        if (error.message.includes("Invalid")) {
          errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
        }
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
          <Text type="secondary">관리자 로그인</Text>
        </div>

        <Form
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
        >
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
            rules={[{ required: true, message: "비밀번호를 입력해주세요" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호"
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
              로그인
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary">
              계정이 없으신가요?{" "}
              <Link to="/register">회원가입</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};
