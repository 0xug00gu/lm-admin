import { Show } from "@refinedev/antd";
import {
  Tabs,
  Descriptions,
  Table,
  Button,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Input,
  TimePicker,
  Alert,
  List,
  Avatar,

  Modal,
  Form,
  Switch,
  Select,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";

const { TextArea } = Input;

interface TimeSlot {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export const MeditationShow = () => {
  // TODO: useShow 훅으로 데이터 가져오기
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, name: "아침 명상", startTime: "06:00", endTime: "08:00", enabled: true },
    { id: 2, name: "오후 명상", startTime: "14:00", endTime: "16:00", enabled: true },
    { id: 3, name: "저녁 명상", startTime: "20:00", endTime: "22:00", enabled: true },
  ]);

  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [form] = Form.useForm();

  const handleAddTimeSlot = () => {
    setEditingTimeSlot(null);
    form.resetFields();
    setIsTimeSlotModalOpen(true);
  };

  const handleEditTimeSlot = (slot: TimeSlot) => {
    setEditingTimeSlot(slot);
    form.setFieldsValue({
      name: slot.name,
      startTime: dayjs(slot.startTime, "HH:mm"),
      endTime: dayjs(slot.endTime, "HH:mm"),
      enabled: slot.enabled,
    });
    setIsTimeSlotModalOpen(true);
  };

  const handleDeleteTimeSlot = (id: number) => {
    Modal.confirm({
      title: "명상 시간 삭제",
      content: "이 명상 시간을 삭제하시겠습니까?",
      onOk: () => {
        setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
      },
    });
  };

  const handleTimeSlotSubmit = () => {
    form.validateFields().then((values) => {
      const newSlot = {
        id: editingTimeSlot?.id || Date.now(),
        name: values.name,
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        enabled: values.enabled ?? true,
      };

      if (editingTimeSlot) {
        setTimeSlots(timeSlots.map((slot) => (slot.id === editingTimeSlot.id ? newSlot : slot)));
      } else {
        setTimeSlots([...timeSlots, newSlot]);
      }

      setIsTimeSlotModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <Show>
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: "챌린지 정보",
            icon: <SettingOutlined />,
            children: (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="챌린지명" span={2}>
                  명상 바디더블링 1기
                </Descriptions.Item>
                <Descriptions.Item label="유형">명상</Descriptions.Item>
                <Descriptions.Item label="기간">2024-02-01 ~ 2024-02-28</Descriptions.Item>
                <Descriptions.Item label="가격">15,000원</Descriptions.Item>
                <Descriptions.Item label="상태">
                  <Tag color="blue">진행중</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="설명" span={2}>
                  #시작으로 명상을 시작하고, #종료로 명상을 종료하는 챌린지입니다.
                </Descriptions.Item>
              </Descriptions>
            ),
          },

          {
            key: "time-settings",
            label: "시간 설정",
            icon: <ClockCircleOutlined />,
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Alert
                  message="명상 시간대 관리"
                  description="참여자가 #시작과 #종료를 통해 명상을 인증할 수 있는 시간대를 설정합니다. 시간대는 무제한으로 추가/수정/삭제할 수 있습니다."
                  type="info"
                  showIcon
                />

                <Card
                  title="명상 시간대 목록"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTimeSlot}>
                      시간대 추가
                    </Button>
                  }
                >
                  <Table
                    dataSource={timeSlots}
                    rowKey="id"
                    pagination={false}
                  >
                    <Table.Column dataIndex="name" title="시간대 이름" />
                    <Table.Column
                      dataIndex="startTime"
                      title="시작 시간"
                      render={(time) => <Tag color="green">{time}</Tag>}
                    />
                    <Table.Column
                      dataIndex="endTime"
                      title="종료 시간"
                      render={(time) => <Tag color="red">{time}</Tag>}
                    />
                    <Table.Column
                      dataIndex="enabled"
                      title="활성화"
                      render={(enabled) =>
                        enabled ? (
                          <Tag color="blue">활성</Tag>
                        ) : (
                          <Tag color="default">비활성</Tag>
                        )
                      }
                    />
                    <Table.Column
                      title="작업"
                      render={(_, record: TimeSlot) => (
                        <Space>
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditTimeSlot(record)}
                          >
                            수정
                          </Button>
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteTimeSlot(record.id)}
                          >
                            삭제
                          </Button>
                        </Space>
                      )}
                    />
                  </Table>
                </Card>

                <Card title="⏰ 일일 현황 알림 시간" size="small">
                  <Space>
                    <label>알림 시간: </label>
                    <TimePicker format="HH:mm" defaultValue={dayjs("21:00", "HH:mm")} />
                    <span style={{ marginLeft: 8, color: "#888" }}>
                      매일 이 시간에 명상 현황을 알려줍니다 (몇 회 완료했는지)
                    </span>
                  </Space>
                  <div style={{ marginTop: 16 }}>
                    <Button type="primary">설정 저장</Button>
                  </div>
                </Card>
              </Space>
            ),
          },

          {
            key: "discord",
            label: "디스코드 연동",
            icon: <MessageOutlined />,
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Alert
                  message="디스코드 봇 연동 상태"
                  description="디스코드 봇이 정상적으로 연동되어 있습니다."
                  type="success"
                  showIcon
                />

                <Card title="📢 채널 설정" size="small">
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="카테고리 ID">
                      <Input placeholder="디스코드 카테고리 ID" />
                    </Descriptions.Item>
                    <Descriptions.Item label="카테고리 이름">
                      명상 바디더블링
                    </Descriptions.Item>
                    <Descriptions.Item label="명상 채널 ID">
                      <Input placeholder="명상 인증 채널 ID" />
                    </Descriptions.Item>
                  </Descriptions>
                  <Button type="primary" style={{ marginTop: 16 }}>
                    채널 설정 저장
                  </Button>
                </Card>

                <Card title="🤖 자동 메시지 활성화" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Switch defaultChecked />
                      <span style={{ marginLeft: 8 }}>일일 명상 현황 메시지 (21:00)</span>
                    </div>
                    <Alert
                      message="명상 인증 메시지"
                      description="#시작과 #종료 메시지는 사용자가 명령어를 입력할 때마다 자동으로 발송되므로 별도 설정이 필요 없습니다."
                      type="info"
                      showIcon
                      style={{ marginTop: 12 }}
                    />
                  </Space>
                </Card>
              </Space>
            ),
          },

          {
            key: "dashboard",
            label: "인증 현황",
            icon: <CheckCircleOutlined />,
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 통합 인증 현황 */}
                <Card title="📊 실시간 명상 현황">
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                      <Statistic
                        title="총 참여자"
                        value={4}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="오늘 명상 횟수"
                        value={7}
                        suffix="회"
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="평균 명상 시간"
                        value={18}
                        suffix="분"
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="참여율"
                        value={75}
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                  </Row>

                  <Table
                    dataSource={[
                      {
                        id: 1,
                        name: "홍길동",
                        discordId: "1기_홍길동",
                        todayCount: 2,
                        sessions: [
                          { startTime: "07:00", endTime: "07:15", duration: 15 },
                          { startTime: "20:30", endTime: "20:50", duration: 20 },
                        ],
                        totalTime: 35,
                        streak: 7,
                      },
                      {
                        id: 2,
                        name: "김철수",
                        discordId: "1기_김철수",
                        todayCount: 2,
                        sessions: [
                          { startTime: "06:00", endTime: "06:20", duration: 20 },
                          { startTime: "14:15", endTime: "14:40", duration: 25 },
                        ],
                        totalTime: 45,
                        streak: 12,
                      },
                      {
                        id: 3,
                        name: "이영희",
                        discordId: "2기_이영희",
                        todayCount: 1,
                        sessions: [
                          { startTime: "08:00", endTime: "08:10", duration: 10 },
                        ],
                        totalTime: 10,
                        streak: 3,
                      },
                      {
                        id: 4,
                        name: "박지민",
                        discordId: "2기_박지민",
                        todayCount: 0,
                        sessions: [],
                        totalTime: 0,
                        streak: 0,
                      },
                    ]}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <div style={{ margin: 0 }}>
                          <strong>오늘의 명상 세션:</strong>
                          {record.sessions.length > 0 ? (
                            <ul style={{ marginTop: 8 }}>
                              {record.sessions.map((session: any, idx: number) => (
                                <li key={idx}>
                                  {session.startTime} ~ {session.endTime} ({session.duration}분)
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ color: "#999", marginTop: 8 }}>오늘 명상 기록이 없습니다.</p>
                          )}
                        </div>
                      ),
                    }}
                  >
                    <Table.Column dataIndex="name" title="이름" width={100} />
                    <Table.Column dataIndex="discordId" title="디스코드 ID" width={150} />
                    <Table.Column
                      dataIndex="todayCount"
                      title="오늘 명상 횟수"
                      width={120}
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>{count}회</Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="totalTime"
                      title="오늘 총 시간"
                      width={120}
                      render={(time) => (
                        <span style={{ fontWeight: time > 0 ? "bold" : "normal" }}>
                          {time}분
                        </span>
                      )}
                    />
                    <Table.Column
                      dataIndex="streak"
                      title="연속 일수"
                      width={100}
                      render={(days) => (
                        <Tag color={days > 0 ? "blue" : "default"}>{days}일</Tag>
                      )}
                    />
                  </Table>
                </Card>
              </Space>
            ),
          },

          {
            key: "participants",
            label: "참여자 통계",
            icon: <TeamOutlined />,
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 참여자 통계 테이블 */}
                <Table
                  dataSource={[
                    {
                      id: 1,
                      name: "홍길동",
                      discordId: "1기_홍길동",
                      status: "active",
                      weeklyCount: 6,
                      totalSessions: 24,
                      totalTime: 420,
                      averageTime: 17.5,
                      streak: 7,
                      badges: ["3day", "5day", "7day"],
                    },
                    {
                      id: 2,
                      name: "김철수",
                      discordId: "1기_김철수",
                      status: "active",
                      weeklyCount: 7,
                      totalSessions: 28,
                      totalTime: 560,
                      averageTime: 20,
                      streak: 12,
                      badges: ["3day", "5day", "7day", "10day"],
                    },
                    {
                      id: 3,
                      name: "이영희",
                      discordId: "2기_이영희",
                      status: "active",
                      weeklyCount: 5,
                      totalSessions: 18,
                      totalTime: 280,
                      averageTime: 15.5,
                      streak: 3,
                      badges: ["3day"],
                    },
                    {
                      id: 4,
                      name: "박지민",
                      discordId: "2기_박지민",
                      status: "inactive",
                      weeklyCount: 2,
                      totalSessions: 8,
                      totalTime: 80,
                      averageTime: 10,
                      streak: 0,
                      badges: [],
                    },
                  ]}
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 1500 }}
                >
                  <Table.Column dataIndex="name" title="이름" width={100} fixed="left" />
                  <Table.Column dataIndex="discordId" title="디스코드 ID" width={150} />
                  <Table.Column
                    dataIndex="status"
                    title="상태"
                    width={100}
                    render={(status) => {
                      const statusMap: Record<string, { color: string; text: string }> = {
                        active: { color: "green", text: "활동중" },
                        inactive: { color: "red", text: "휴면" },
                      };
                      const s = statusMap[status] || statusMap.active;
                      return <Tag color={s.color}>{s.text}</Tag>;
                    }}
                  />
                  <Table.Column
                    dataIndex="weeklyCount"
                    title="주간 명상 횟수"
                    width={120}
                    render={(count) => `${count}회`}
                  />
                  <Table.Column
                    dataIndex="totalSessions"
                    title="총 명상 횟수"
                    width={120}
                    render={(count) => `${count}회`}
                  />
                  <Table.Column
                    dataIndex="totalTime"
                    title="총 명상 시간"
                    width={120}
                    render={(time) => `${time}분`}
                  />
                  <Table.Column
                    dataIndex="averageTime"
                    title="평균 시간"
                    width={100}
                    render={(time) => `${time}분`}
                  />
                  <Table.Column
                    dataIndex="streak"
                    title="연속 일수"
                    width={100}
                    render={(days) => <Tag color={days > 0 ? "blue" : "default"}>{days}일</Tag>}
                  />
                  <Table.Column
                    dataIndex="badges"
                    title="뱃지"
                    width={150}
                    render={(badges) => (
                      <Space>
                        {badges?.includes("3day") && <span>🌱</span>}
                        {badges?.includes("5day") && <span>❤️‍🔥</span>}
                        {badges?.includes("7day") && <span>👑</span>}
                        {badges?.includes("10day") && <span>🤴🏻</span>}
                      </Space>
                    )}
                  />
                  <Table.Column
                    title="작업"
                    width={150}
                    fixed="right"
                    render={(_, _record: any) => (
                      <Space>
                        <Button size="small">상세</Button>
                        <Button size="small">리포트</Button>
                      </Space>
                    )}
                  />
                </Table>
              </Space>
            ),
          },

          {
            key: "attendance-detail",
            label: "주간 명상 상세",
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Space>
                  <Select placeholder="주차 선택" style={{ width: 200 }} defaultValue="1">
                    <Select.Option value="1">1주차</Select.Option>
                    <Select.Option value="2">2주차</Select.Option>
                    <Select.Option value="3">3주차</Select.Option>
                    <Select.Option value="4">4주차</Select.Option>
                  </Select>
                  <Button type="primary">조회</Button>
                </Space>

                {/* 통합 테이블 */}
                <Card title="📊 주간 명상 현황" size="small">
                  <Alert
                    message="명상 횟수 안내"
                    description="각 날짜별로 #시작 #종료 한 쌍이 1회로 카운트됩니다."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    dataSource={[
                      {
                        id: 1,
                        name: "홍길동",
                        mon: 2,
                        tue: 1,
                        wed: 2,
                        thu: 1,
                        fri: 2,
                        sat: 1,
                        sun: 0,
                        weeklyTotal: 9,
                      },
                      {
                        id: 2,
                        name: "김철수",
                        mon: 2,
                        tue: 2,
                        wed: 1,
                        thu: 2,
                        fri: 1,
                        sat: 2,
                        sun: 1,
                        weeklyTotal: 11,
                      },
                      {
                        id: 3,
                        name: "이영희",
                        mon: 1,
                        tue: 1,
                        wed: 0,
                        thu: 1,
                        fri: 1,
                        sat: 0,
                        sun: 1,
                        weeklyTotal: 5,
                      },
                      {
                        id: 4,
                        name: "박지민",
                        mon: 0,
                        tue: 1,
                        wed: 0,
                        thu: 0,
                        fri: 0,
                        sat: 1,
                        sun: 0,
                        weeklyTotal: 2,
                      },
                    ]}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                    pagination={{ pageSize: 20 }}
                  >
                    <Table.Column dataIndex="name" title="이름" fixed="left" width={100} />
                    <Table.Column
                      dataIndex="mon"
                      title="월"
                      width={80}
                      align="center"
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>
                          {count}회
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="tue"
                      title="화"
                      width={80}
                      align="center"
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>
                          {count}회
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="wed"
                      title="수"
                      width={80}
                      align="center"
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>
                          {count}회
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="thu"
                      title="목"
                      width={80}
                      align="center"
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>
                          {count}회
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="fri"
                      title="금"
                      width={80}
                      align="center"
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>
                          {count}회
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="sat"
                      title="토"
                      width={80}
                      align="center"
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>
                          {count}회
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="sun"
                      title="일"
                      width={80}
                      align="center"
                      render={(count) => (
                        <Tag color={count > 0 ? "green" : "default"}>
                          {count}회
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="weeklyTotal"
                      title="주간 합계"
                      width={100}
                      align="center"
                      fixed="right"
                      render={(count) => (
                        <Tag
                          color={count >= 7 ? "blue" : count >= 3 ? "green" : "default"}
                          style={{ fontSize: "14px", fontWeight: "bold" }}
                        >
                          {count}회
                        </Tag>
                      )}
                    />
                  </Table>
                </Card>
              </Space>
            ),
          },

          {
            key: "badges",
            label: "뱃지 관리",
            icon: <TrophyOutlined />,
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Card title="🏆 연속 일수 뱃지 설정" size="small">
                  <List
                    dataSource={[
                      { days: 3, emoji: "🌱", name: "3일 연속 명상" },
                      { days: 5, emoji: "❤️‍🔥", name: "5일 연속 명상" },
                      { days: 7, emoji: "👑", name: "7일 연속 명상" },
                      { days: 10, emoji: "🤴🏻", name: "10일 연속 명상" },
                    ]}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button size="small">수정</Button>,
                          <Button size="small" danger>
                            삭제
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar size="large">{item.emoji}</Avatar>}
                          title={item.name}
                          description={`${item.days}일 연속 명상시 부여`}
                        />
                      </List.Item>
                    )}
                  />
                  <Button type="dashed" block style={{ marginTop: 16 }}>
                    + 뱃지 추가
                  </Button>
                </Card>
              </Space>
            ),
          },

          {
            key: "messages",
            label: "메시지 템플릿",
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Alert
                  message="명상 인증 메시지"
                  description="명상 #시작/#종료 메시지와 21시 일일 현황 메시지를 설정합니다. 모든 시간대에서 동일한 메시지가 사용됩니다."
                  type="info"
                  showIcon
                />

                <Card title="🧘 명상 #시작 메시지" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>시작 인증 완료 메시지</label>
                      <TextArea
                        rows={4}
                        defaultValue="✅ 명상 시작!&#10;👤 {디스코드아이디}&#10;⏰ 시작 시간: {시작시간}&#10;&#10;명상이 끝나면 #종료 를 입력해주세요."
                      />
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        사용 가능한 변수: {"{디스코드아이디}"}, {"{시작시간}"}
                      </div>
                    </div>
                  </Space>
                </Card>

                <Card title="🧘‍♀️ 명상 #종료 메시지" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>종료 인증 완료 메시지</label>
                      <TextArea
                        rows={5}
                        defaultValue="✅ 명상 완료!&#10;👤 {디스코드아이디}&#10;⏱️ 명상 시간: {명상시간}분 ({시작시간} ~ {종료시간})&#10;📅 오늘 명상: {오늘명상횟수}회&#10;🔥 연속 {연속일수}일째"
                      />
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        사용 가능한 변수: {"{디스코드아이디}"}, {"{명상시간}"}, {"{시작시간}"}, {"{종료시간}"}, {"{오늘명상횟수}"}, {"{연속일수}"}
                      </div>
                    </div>
                  </Space>
                </Card>

                <Card title="📊 일일 명상 현황 메시지 (21:00)" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>현황 메시지</label>
                      <TextArea
                        rows={6}
                        defaultValue="📊 오늘의 명상 현황&#10;&#10;@{사용자} {뱃지}&#10;오늘 명상: {오늘명상횟수}회 (총 {오늘명상시간}분)&#10;&#10;#시작 #종료 한 쌍이 1회로 카운트됩니다.&#10;오늘도 수고하셨습니다! 🧘"
                      />
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        사용 가능한 변수: {"{사용자}"}, {"{뱃지}"}, {"{오늘명상횟수}"}, {"{오늘명상시간}"}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <label>알림 시간: </label>
                        <TimePicker format="HH:mm" defaultValue={dayjs("21:00", "HH:mm")} />
                        <span style={{ marginLeft: 8, color: "#888" }}>
                          매일 이 시간에 명상 현황을 알립니다
                        </span>
                      </div>
                    </div>
                  </Space>
                </Card>

                <Card title="🎉 웰컴 메시지" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>1:1 DM 웰컴 메시지</label>
                      <TextArea
                        rows={10}
                        defaultValue=":star2: 명상 바디더블링 디스코드 – 필독 공지사항&#10;&#10;## :one: 명상 인증 방법&#10;명상을 시작할 때: **#시작**&#10;명상을 종료할 때: **#종료**&#10;&#10;#시작과 #종료 한 쌍이 1회 명상으로 카운트됩니다.&#10;&#10;## :two: 서버 프로필 설정 (필수!)&#10;입장 후 반드시 서버별 프로필 이름을 다음 형식으로 수정해주세요.&#10;&#10;:white_check_mark: 형식: N기_이름&#10;예시) 1기_수하, 9기_정민하"
                      />
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        새 참여자가 디스코드에 입장하면 자동으로 DM이 발송됩니다
                      </div>
                    </div>
                  </Space>
                </Card>

                <Button type="primary">모든 템플릿 저장</Button>
              </Space>
            ),
          },
        ]}
      />

      {/* 시간대 추가/수정 모달 */}
      <Modal
        title={editingTimeSlot ? "명상 시간대 수정" : "명상 시간대 추가"}
        open={isTimeSlotModalOpen}
        onOk={handleTimeSlotSubmit}
        onCancel={() => {
          setIsTimeSlotModalOpen(false);
          form.resetFields();
        }}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="시간대 이름"
            rules={[{ required: true, message: "시간대 이름을 입력해주세요" }]}
          >
            <Input placeholder="예: 아침 명상, 점심 명상" />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="시작 시간"
            rules={[{ required: true, message: "시작 시간을 선택해주세요" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="종료 시간"
            rules={[{ required: true, message: "종료 시간을 선택해주세요" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="enabled" label="활성화" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Show>
  );
};
