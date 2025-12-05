import { Card, Typography, Button, Result } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import { config } from "../../config/env";

const { Text } = Typography;

export const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // 저장된 인증 정보 확인
    const authDataStr = localStorage.getItem("pb_auth");
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        setUserName(authData.model?.name || "");

        // 이미 verified된 사용자면 대시보드로
        if (authData.model?.verified) {
          navigate("/");
        }
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // 상태 새로고침 (관리자가 승인했는지 확인)
  const handleRefreshStatus = async () => {
    const authDataStr = localStorage.getItem("pb_auth");
    if (!authDataStr) {
      navigate("/login");
      return;
    }

    try {
      const authData = JSON.parse(authDataStr);
      const pb = new PocketBase(config.pocketbaseUrl);

      // 현재 사용자 정보 다시 조회
      const user = await pb.collection("users").getOne(authData.model.id);

      if (user.verified) {
        // 승인됨! 토큰 갱신 후 대시보드로
        localStorage.setItem("pb_auth", JSON.stringify({
          token: authData.token,
          model: user,
        }));
        navigate("/");
      } else {
        // 아직 승인되지 않음
        alert("아직 관리자 승인이 완료되지 않았습니다.");
      }
    } catch (error) {
      console.error("상태 확인 실패:", error);
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pb_auth");
    navigate("/login");
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
      <Card style={{ width: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Result
          icon={<ClockCircleOutlined style={{ color: "#faad14" }} />}
          title="사용자 인증을 기다려주세요"
          subTitle={
            <div style={{ marginTop: 16 }}>
              <Text>
                {userName && <strong>{userName}</strong>}님, 회원가입이 완료되었습니다.
              </Text>
              <br />
              <br />
              <Text type="secondary">
                관리자가 계정을 승인하면 서비스를 이용하실 수 있습니다.
                <br />
                승인은 영업일 기준 1~2일 내에 처리됩니다.
              </Text>
            </div>
          }
          extra={[
            <Button key="refresh" type="primary" onClick={handleRefreshStatus}>
              승인 상태 확인
            </Button>,
            <Button key="logout" onClick={handleLogout}>
              로그아웃
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
};
