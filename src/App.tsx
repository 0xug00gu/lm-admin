import { Refine } from "@refinedev/core";
import { RefineThemes, ThemedLayoutV2, notificationProvider } from "@refinedev/antd";
import { pocketbaseDataProvider } from "./providers/pocketbaseDataProvider";
import { authProvider } from "./providers/authProvider";
import { config } from "./config/env";
import routerProvider from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import koKR from "antd/locale/ko_KR";
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  DollarOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import "@refinedev/antd/dist/reset.css";

// Auth
import { LoginPage, RegisterPage, PendingApprovalPage } from "./pages/auth";

// Dashboard
import { DashboardPage } from "./pages/dashboard";

// Users
import { UserList } from "./pages/users/list";
import { UserShow } from "./pages/users/show";
import { UserCreate } from "./pages/users/create";

// Classes
import { ClassList } from "./pages/classes/list";
import { ClassShow } from "./pages/classes/show";

// Challenges
import { ChallengeList } from "./pages/challenges/list";
import { ChallengeCreate } from "./pages/challenges/create";
import { ChallengeEdit } from "./pages/challenges/edit";
import { ChallengeShow } from "./pages/challenges/show";

// Channels
import { ChannelShow } from "./pages/channels/show";

// System Channels
import { SystemChannelList } from "./pages/system-channels/list";



// Revenue
import { RevenueDashboard } from "./pages/revenue/dashboard";
import { SalesLog } from "./pages/revenue/sales-log";
import { ManualSaleAdd } from "./pages/revenue/manual-add";
import { PGManagement } from "./pages/revenue/pg-management";

// 인증된 사용자만 접근 가능한 레이아웃 (verified 체크 포함)
const AuthenticatedLayout = () => {
  const authDataStr = localStorage.getItem("pb_auth");

  if (!authDataStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const authData = JSON.parse(authDataStr);

    // verified가 false면 승인 대기 페이지로
    if (!authData.model?.verified) {
      return <Navigate to="/pending-approval" replace />;
    }

    return (
      <ThemedLayoutV2>
        <Outlet />
      </ThemedLayoutV2>
    );
  } catch {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue} locale={koKR}>
        <AntdApp>
          <Refine
            dataProvider={pocketbaseDataProvider(
              config.pocketbaseUrl,
              config.pocketbaseAdminEmail,
              config.pocketbaseAdminPassword
            )}
            authProvider={authProvider}
            notificationProvider={notificationProvider}
            routerProvider={routerProvider}
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: {
                  label: "대시보드",
                  icon: <DashboardOutlined />,
                },
              },
              {
                name: "discord_users",
                list: "/users",
                create: "/users/create",
                show: "/users/show/:id",
                meta: {
                  label: "사용자 관리",
                  icon: <UserOutlined />,
                },
              },
              {
                name: "program",
                list: "/classes",
                show: "/classes/show/:id",
                meta: {
                  label: "프로그램 관리",
                  icon: <BookOutlined />,
                },
              },
              {
                name: "challenges",
                list: "/challenges",
                create: "/challenges/create",
                edit: "/challenges/edit/:id",
                show: "/challenges/show/:id",
                meta: {
                  label: "챌린지 관리",
                  icon: <TrophyOutlined />,
                },
              },
              {
                name: "channels",
                show: "/channels/show/:id",
              },
              {
                name: "system-channels",
                list: "/system-channels",
                meta: {
                  label: "시스템 채널",
                  icon: <SettingOutlined />,
                },
              },
              {
                name: "revenue",
                meta: {
                  label: "매출 관리",
                  icon: <DollarOutlined />,
                },
              },
              {
                name: "revenue-dashboard",
                list: "/revenue/dashboard",
                meta: {
                  label: "매출 대시보드",
                  parent: "revenue",
                },
              },
              {
                name: "sales-log",
                list: "/revenue/sales-log",
                meta: {
                  label: "판매 로그",
                  parent: "revenue",
                },
              },
              {
                name: "manual-add",
                list: "/revenue/manual-add",
                meta: {
                  label: "수동 매출 추가",
                  parent: "revenue",
                },
              },
              {
                name: "pg-management",
                list: "/revenue/pg-management",
                meta: {
                  label: "PG 연동 관리",
                  parent: "revenue",
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              {/* 인증 페이지 (비로그인 상태에서 접근 가능) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />

              {/* 인증된 사용자만 접근 가능한 페이지 */}
              <Route element={<AuthenticatedLayout />}>
                {/* Dashboard */}
                <Route index element={<DashboardPage />} />

                {/* Users */}
                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path="create" element={<UserCreate />} />
                  <Route path="show/:id" element={<UserShow />} />
                </Route>

                {/* Classes */}
                <Route path="/classes">
                  <Route index element={<ClassList />} />
                  <Route path="show/:id" element={<ClassShow />} />
                </Route>

                {/* Challenges */}
                <Route path="/challenges">
                  <Route index element={<ChallengeList />} />
                  <Route path="create" element={<ChallengeCreate />} />
                  <Route path="edit/:id" element={<ChallengeEdit />} />
                  <Route path="show/:id" element={<ChallengeShow />} />
                </Route>

                {/* Channels */}
                <Route path="/channels">
                  <Route path="show/:id" element={<ChannelShow />} />
                </Route>

                {/* System Channels */}
                <Route path="/system-channels">
                  <Route index element={<SystemChannelList />} />
                </Route>

                {/* Revenue */}
                <Route path="/revenue">
                  <Route path="dashboard" element={<RevenueDashboard />} />
                  <Route path="sales-log" element={<SalesLog />} />
                  <Route path="manual-add" element={<ManualSaleAdd />} />
                  <Route path="pg-management" element={<PGManagement />} />
                </Route>
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
