import dayjs from "dayjs";
import { Show } from "@refinedev/antd";
import { useShow, useCreate, useDelete, useList } from "@refinedev/core";
import {
  Tabs,
  Descriptions,
  Table,
  Button,
  Select,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Badge,
  Input,
  TimePicker,
  Switch,
  InputNumber,
  Alert,
  List,
  Avatar,
  Divider,
  Modal,
  Form,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { TextArea } = Input;

export const ChallengeShow = () => {
  const { queryResult } = useShow({
    resource: "challenges",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>("");
  const [channelForm] = Form.useForm();

  const { mutate: createChannel } = useCreate();
  const { mutate: deleteChannel } = useDelete();

  // 채널 데이터 가져오기
  const { data: channelsData, refetch: refetchChannels } = useList({
    resource: "channels",
    pagination: {
      mode: "off",
    },
  });

  const channels = channelsData?.data || [];

  // 길드 목록 가져오기
  const fetchGuilds = async () => {
    try {
      const response = await fetch("http://146.56.158.19/api/admin/discord/guilds");
      const result = await response.json();
      if (result.success) {
        setGuilds(result.data);
      }
    } catch (error) {
      message.error("길드 목록을 가져오는데 실패했습니다.");
    }
  };

  // 카테고리 목록 가져오기
  const fetchCategories = async (guildId: string) => {
    try {
      const response = await fetch(`http://146.56.158.19/api/admin/discord/guilds/${guildId}/categories`);
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      message.error("카테고리 목록을 가져오는데 실패했습니다.");
    }
  };

  // 길드 선택 시
  const handleGuildChange = (guildId: string) => {
    setSelectedGuildId(guildId);
    fetchCategories(guildId);
    channelForm.setFieldsValue({ parent_id: undefined });
  };

  // 채널 추가
  const handleAddChannel = async () => {
    try {
      const values = await channelForm.validateFields();

      // Discord API를 통해 채널 생성
      const response = await fetch(`http://146.56.158.19/api/admin/discord/guilds/${selectedGuildId}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          type: values.type || 0,
          parent_id: values.parent_id,
          topic: values.topic,
          owner_id: values.owner_id,
          is_private: values.is_private || false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success("채널이 생성되었습니다.");
        setIsChannelModalOpen(false);
        channelForm.resetFields();
        setSelectedGuildId("");
        setCategories([]);
        refetchChannels();
      } else {
        message.error("채널 생성에 실패했습니다.");
      }
    } catch (error) {
      message.error("채널 생성 중 오류가 발생했습니다.");
    }
  };

  // 채널 삭제
  const handleDeleteChannel = (id: string) => {
    Modal.confirm({
      title: "채널을 삭제하시겠습니까?",
      content: "해당 작업은 되돌릴 수 없습니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: () => {
        deleteChannel(
          {
            resource: "channels",
            id,
          },
          {
            onSuccess: () => {
              message.success("채널이 삭제되었습니다.");
              refetchChannels();
            },
          }
        );
      },
    });
  };

  return (
    <Show isLoading={isLoading}>
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
                  {record?.name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="채널 ID">{record?.channel_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="역할 ID">{record?.role_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="카테고리 ID">{record?.category_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="상태">
                  <Tag color={record?.is_active ? "blue" : "red"}>
                    {record?.is_active ? "활성" : "비활성"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="설명" span={2}>
                  {record?.description || "-"}
                </Descriptions.Item>
              </Descriptions>
            ),
          },

          {
            key: "challenge-settings",
            label: "인증 설정",
            icon: <ClockCircleOutlined />,
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 아침 인증 설정 */}
                <Card title="☀️ 아침 인증 시간" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>정상 인증 시간</label>
                      <TimePicker.RangePicker
                        format="HH:mm"
                        defaultValue={[dayjs("05:00", "HH:mm"), dayjs("10:00", "HH:mm")]}
                      />
                    </div>
                    <div>
                      <label>지각 인증 시간</label>
                      <TimePicker.RangePicker
                        format="HH:mm"
                        defaultValue={[dayjs("10:00", "HH:mm"), dayjs("11:00", "HH:mm")]}
                      />
                    </div>
                  </Space>
                </Card>

                {/* 데일리 인증 설정 */}
                <Card title="🌙 데일리 인증 시간" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>정상 인증 시간</label>
                      <TimePicker.RangePicker
                        format="HH:mm"
                        defaultValue={[dayjs("17:00", "HH:mm"), dayjs("23:59", "HH:mm")]}
                      />
                    </div>
                    <div>
                      <label>지각 인증 시간</label>
                      <TimePicker.RangePicker
                        format="HH:mm"
                        defaultValue={[dayjs("00:00", "HH:mm"), dayjs("01:00", "HH:mm")]}
                      />
                    </div>
                  </Space>
                </Card>

                {/* 인증 정책 설정 */}
                <Card title="⚙️ 인증 정책" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <strong>주간 최소 인증 횟수</strong>
                      <div style={{ marginTop: 8 }}>
                        <InputNumber defaultValue={4} min={1} max={7} addonAfter="회" />
                        <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                          라이프 마스터 클럽: 주 4회 미만 시 리셋방 이동 (월요일 04시)
                        </div>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <strong>부활 조건</strong>
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          아침 최소: <InputNumber defaultValue={3} min={0} max={7} addonAfter="회" />
                          데일리 최소: <InputNumber defaultValue={3} min={0} max={7} addonAfter="회" />
                        </Space>
                        <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                          리셋방에서 주간 아침 3회 이상 + 데일리 3회 이상 시 복귀
                        </div>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <strong>휴식 상태 전환</strong>
                      <div style={{ marginTop: 8 }}>
                        <InputNumber defaultValue={2} min={1} max={4} addonAfter="주" />
                        <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                          리셋방에서 부활 실패 시 휴식 상태로 전환
                        </div>
                      </div>
                    </div>
                  </Space>
                </Card>

                <Button type="primary">설정 저장</Button>
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

                {/* 채널 관리 */}
                <Card title="📢 채널 관리" size="small">
                  <Space style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsChannelModalOpen(true)}
                    >
                      채널 생성
                    </Button>
                  </Space>
                  <Table
                    dataSource={channels}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    onRow={(record: any) => ({
                      onClick: () => {
                        window.location.href = `/channels/show/${record.id}`;
                      },
                      style: { cursor: 'pointer' }
                    })}
                  >
                    <Table.Column dataIndex="channel_id" title="채널 ID" width={150} />
                    <Table.Column dataIndex="name" title="채널명" />
                    <Table.Column dataIndex="type" title="타입" width={100} />
                    <Table.Column
                      dataIndex="is_private"
                      title="비공개"
                      width={80}
                      align="center"
                      render={(is_private) => (
                        <Tag color={is_private ? "red" : "green"}>
                          {is_private ? "비공개" : "공개"}
                        </Tag>
                      )}
                    />
                    <Table.Column
                      dataIndex="is_active"
                      title="상태"
                      width={80}
                      align="center"
                      render={(is_active) => (
                        <Tag color={is_active ? "green" : "red"}>
                          {is_active ? "활성" : "비활성"}
                        </Tag>
                      )}
                    />
                    <Table.Column
                      title="작업"
                      width={80}
                      render={(_, record: any) => (
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannel(record.id);
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    />
                  </Table>
                </Card>

                {/* 자동 메시지 설정 */}
                <Card title="🤖 자동 메시지 활성화" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Switch defaultChecked />
                      <span style={{ marginLeft: 8 }}>아침 인증 시작 메시지 (05:00)</span>
                    </div>
                    <div>
                      <Switch defaultChecked />
                      <span style={{ marginLeft: 8 }}>아침 인증 마감 메시지 (10:00)</span>
                    </div>
                    <div>
                      <Switch defaultChecked />
                      <span style={{ marginLeft: 8 }}>아침 인증 현황 메시지 (10:00)</span>
                    </div>
                    <div>
                      <Switch defaultChecked />
                      <span style={{ marginLeft: 8 }}>데일리 인증 시작 메시지 (17:00)</span>
                    </div>
                    <div>
                      <Switch defaultChecked />
                      <span style={{ marginLeft: 8 }}>데일리 인증 마감 메시지 (23:59)</span>
                    </div>
                    <div>
                      <Switch defaultChecked />
                      <span style={{ marginLeft: 8 }}>데일리 인증 현황 메시지 (22:00)</span>
                    </div>
                  </Space>
                </Card>

                <Modal
                  title="채널 생성"
                  open={isChannelModalOpen}
                  onOk={handleAddChannel}
                  onCancel={() => {
                    setIsChannelModalOpen(false);
                    channelForm.resetFields();
                    setSelectedGuildId("");
                    setCategories([]);
                  }}
                  okText="생성"
                  cancelText="취소"
                  afterOpenChange={(open) => {
                    if (open) {
                      fetchGuilds();
                    }
                  }}
                >
                  <Form form={channelForm} layout="vertical">
                    <Form.Item
                      label="길드 (서버)"
                      rules={[{ required: true, message: "길드를 선택하세요" }]}
                    >
                      <Select
                        placeholder="길드를 선택하세요"
                        onChange={handleGuildChange}
                        value={selectedGuildId}
                        options={guilds.map((guild) => ({
                          label: `${guild.name} (멤버: ${guild.member_count}명)`,
                          value: guild.id,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name="parent_id"
                      label="카테고리"
                      rules={[{ required: true, message: "카테고리를 선택하세요" }]}
                    >
                      <Select
                        placeholder="카테고리를 선택하세요"
                        disabled={!selectedGuildId}
                        options={categories.map((category) => ({
                          label: category.name,
                          value: category.id,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name="name"
                      label="채널명"
                      rules={[{ required: true, message: "채널명을 입력하세요" }]}
                    >
                      <Input placeholder="채널명을 입력하세요" />
                    </Form.Item>
                    <Form.Item
                      name="type"
                      label="채널 타입"
                      initialValue={0}
                    >
                      <Select
                        options={[
                          { label: "텍스트 채널", value: 0 },
                          { label: "음성 채널", value: 2 },
                          { label: "카테고리", value: 4 },
                          { label: "공지 채널", value: 5 },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      name="topic"
                      label="채널 설명"
                    >
                      <Input.TextArea placeholder="채널 설명 (선택사항)" rows={2} />
                    </Form.Item>
                    <Form.Item
                      name="owner_id"
                      label="소유자 Discord ID"
                    >
                      <Input placeholder="소유자의 Discord ID (선택사항)" />
                    </Form.Item>
                    <Form.Item
                      name="is_private"
                      label="비공개 채널"
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <Switch />
                    </Form.Item>
                  </Form>
                </Modal>
              </Space>
            ),
          },

          {
            key: "dashboard",
            label: "인증 현황",
            icon: <CheckCircleOutlined />,
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 인증 현황 */}
                <Card title="📊 오늘 인증 현황">
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Statistic
                        title="총 참여자"
                        value={30}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="오늘 아침 인증"
                        value={22}
                        suffix="/ 30"
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="오늘 데일리 인증"
                        value={18}
                        suffix="/ 30"
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                     <Col span={6}>
                      <Statistic
                        title="전체 인증률"
                        value={73.3}
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                  </Row>
                  <Table
                    dataSource={[]}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                  >
                    <Table.Column dataIndex="name" title="이름" width={100} fixed="left" />
                    <Table.Column dataIndex="team" title="팀" width={100} />
                    <Table.Column
                      dataIndex="morningStatus"
                      title="오늘 아침"
                      width={100}
                      align="center"
                      render={(status) => {
                        if (status === "done") return <span style={{ fontSize: 20 }}>✅</span>;
                        if (status === "late") return <span style={{ fontSize: 20 }}>⏳</span>;
                        return <span style={{ fontSize: 20 }}>❌</span>;
                      }}
                    />
                    <Table.Column
                      dataIndex="dailyStatus"
                      title="오늘 데일리"
                      width={100}
                      align="center"
                      render={(status) => {
                        if (status === "done") return <span style={{ fontSize: 20 }}>✅</span>;
                        if (status === "late") return <span style={{ fontSize: 20 }}>⏳</span>;
                        if (status === "waiting") return <span style={{ fontSize: 20 }}>⬜</span>;
                        return <span style={{ fontSize: 20 }}>❌</span>;
                      }}
                    />
                    <Table.Column
                      dataIndex="weeklyMorningCount"
                      title="주간 아침"
                      width={100}
                      render={(count) => `${count}/7`}
                    />
                    <Table.Column
                      dataIndex="weeklyDailyCount"
                      title="주간 데일리"
                      width={100}
                      render={(count) => `${count}/7`}
                    />
                    <Table.Column
                      dataIndex="streak"
                      title="연속 인증"
                      width={100}
                      render={(days) => <Badge count={days} showZero color="blue" />}
                    />
                     <Table.Column
                      dataIndex="lastCheckTime"
                      title="최근 인증 시간"
                      width={150}
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
                {/* 필터 */}
                <Space>
                  <Select placeholder="팀 선택" style={{ width: 150 }}>
                    <Select.Option value="all">전체</Select.Option>
                    <Select.Option value="team1">1기 A팀</Select.Option>
                    <Select.Option value="team2">1기 B팀</Select.Option>
                  </Select>
                  <Select placeholder="주차 선택" style={{ width: 150 }}>
                    <Select.Option value="1">1주차</Select.Option>
                    <Select.Option value="2">2주차</Select.Option>
                    <Select.Option value="3">3주차</Select.Option>
                    <Select.Option value="4">4주차</Select.Option>
                  </Select>
                  <Button type="primary">조회</Button>
                  <Button>엑셀 다운로드</Button>
                </Space>

                {/* 참여자 통계 테이블 */}
                <Table
                  dataSource={[]}
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 1500 }}
                >
                  <Table.Column dataIndex="name" title="이름" width={100} fixed="left" />
                  <Table.Column dataIndex="team" title="팀" width={100} />
                  <Table.Column dataIndex="discordId" title="디스코드 ID" width={150} />
                  <Table.Column
                    dataIndex="status"
                    title="상태"
                    width={100}
                    render={(status) => {
                      const statusMap: Record<string, { color: string; text: string }> = {
                        active: { color: "green", text: "활동중" },
                        reset: { color: "orange", text: "부활대기" },
                        休息: { color: "red", text: "휴식" },
                      };
                      const s = statusMap[status] || statusMap.active;
                      return <Tag color={s.color}>{s.text}</Tag>;
                    }}
                  />
                  <Table.Column
                    dataIndex="weeklyMorningCount"
                    title="주간 아침 인증"
                    width={120}
                    render={(count) => `${count}회`}
                  />
                  <Table.Column
                    dataIndex="weeklyDailyCount"
                    title="주간 데일리 인증"
                    width={120}
                    render={(count) => `${count}회`}
                  />
                  <Table.Column
                    dataIndex="weeklyRate"
                    title="주간 달성률"
                    width={120}
                    render={(rate) => `${rate}%`}
                  />
                  <Table.Column
                    dataIndex="totalRate"
                    title="전체 달성률"
                    width={120}
                    render={(rate) => `${rate}%`}
                  />
                  <Table.Column
                    dataIndex="streak"
                    title="연속 인증"
                    width={100}
                    render={(days) => (
                      <Badge count={days} showZero color="blue" />
                    )}
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
                    render={() => (
                      <Space>
                        <Button size="small">상세</Button>
                        <Button size="small">리포트</Button>
                        <Button size="small" danger>
                          방출
                        </Button>
                      </Space>
                    )}
                  />
                </Table>
              </Space>
            ),
          },

          {
            key: "attendance-detail",
            label: "주간 출석 상세",
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Space>
                  <Select placeholder="주차 선택" style={{ width: 200 }} defaultValue="current">
                    <Select.Option value="current">이번 주</Select.Option>
                    <Select.Option value="1">1주차</Select.Option>
                    <Select.Option value="2">2주차</Select.Option>
                    <Select.Option value="3">3주차</Select.Option>
                    <Select.Option value="4">4주차</Select.Option>
                  </Select>
                  <Select placeholder="팀 선택" style={{ width: 150 }}>
                    <Select.Option value="all">전체</Select.Option>
                    <Select.Option value="team1">1기 A팀</Select.Option>
                    <Select.Option value="team2">1기 B팀</Select.Option>
                  </Select>
                </Space>

                {/* 주간 아침 인증 현황 */}
                <Card title="☀️ 주간 아침 인증 현황" size="small">
                  <Table dataSource={[]} rowKey="id" scroll={{ x: 1200 }} pagination={false}>
                    <Table.Column dataIndex="name" title="이름" fixed="left" width={100} />
                    <Table.Column dataIndex="team" title="팀" width={100} />
                    <Table.Column
                      title="월"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>✅</span>}
                    />
                    <Table.Column
                      title="화"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>⏳</span>}
                    />
                    <Table.Column
                      title="수"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>✅</span>}
                    />
                    <Table.Column
                      title="목"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>❌</span>}
                    />
                    <Table.Column
                      title="금"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>✅</span>}
                    />
                    <Table.Column
                      title="토"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>⏳</span>}
                    />
                    <Table.Column
                      title="일"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>⬜</span>}
                    />
                    <Table.Column
                      dataIndex="weeklyMorningCount"
                      title="주간 합계"
                      width={100}
                      render={(count) => `${count || 0}/7`}
                    />
                  </Table>
                </Card>

                {/* 주간 데일리 인증 현황 */}
                <Card title="🌙 주간 데일리 인증 현황" size="small">
                  <Table dataSource={[]} rowKey="id" scroll={{ x: 1200 }} pagination={false}>
                    <Table.Column dataIndex="name" title="이름" fixed="left" width={100} />
                    <Table.Column dataIndex="team" title="팀" width={100} />
                    <Table.Column
                      title="월"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>✅</span>}
                    />
                    <Table.Column
                      title="화"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>✅</span>}
                    />
                    <Table.Column
                      title="수"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>⏳</span>}
                    />
                    <Table.Column
                      title="목"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>❌</span>}
                    />
                    <Table.Column
                      title="금"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>✅</span>}
                    />
                    <Table.Column
                      title="토"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>✅</span>}
                    />
                    <Table.Column
                      title="일"
                      width={80}
                      align="center"
                      render={() => <span style={{ fontSize: 18 }}>⬜</span>}
                    />
                    <Table.Column
                      dataIndex="weeklyDailyCount"
                      title="주간 합계"
                      width={100}
                      render={(count) => `${count || 0}/7`}
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
                <Card title="🏆 연속 인증 뱃지 설정" size="small">
                  <List
                    dataSource={[
                      { days: 3, emoji: "🌱", name: "3일 연속 인증" },
                      { days: 5, emoji: "❤️‍🔥", name: "5일 연속 인증" },
                      { days: 7, emoji: "👑", name: "7일 연속 인증" },
                      { days: 10, emoji: "🤴🏻", name: "10일 연속 인증" },
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
                          description={`${item.days}일 연속 인증시 부여`}
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
                <Card title="☀️ 아침 인증 메시지" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>인증 시작 메시지 (05:00)</label>
                      <TextArea
                        rows={3}
                        defaultValue="@everyone 좋은 아침입니다! ☀️&#10;아침 인증 시간이 시작되었습니다.&#10;#인증 태그와 함께 인증해주세요!"
                      />
                    </div>
                    <div>
                      <label>인증 마감 메시지 (10:00)</label>
                      <TextArea
                        rows={3}
                        defaultValue="⏰ {날짜} 아침 인증 마감! ⏰&#10;더 이상 아침 인증을 받지 않습니다.&#10;지각으로 처리됩니다."
                      />
                    </div>
                    <div>
                      <label>인증 완료 메시지 (정상)</label>
                      <TextArea
                        rows={3}
                        defaultValue="✅ {팀이름} 아침 인증 완료!&#10;📅{n}일차 정상&#10;👤{사용자 디스코드 아이디}"
                      />
                    </div>
                    <div>
                      <label>인증 완료 메시지 (지각)</label>
                      <TextArea
                        rows={3}
                        defaultValue="⏳ {팀이름} 아침 인증 완료!&#10;📅{n}일차 지각&#10;👤{사용자 디스코드 아이디}"
                      />
                    </div>
                    <div>
                      <label>인증 현황 메시지 (10:00)</label>
                      <TextArea
                        rows={3}
                        defaultValue="@{사용자 디스코드 아이디} {뱃지}&#10;✅⏳❌⬜⬜⬜⬜"
                      />
                    </div>
                  </Space>
                </Card>

                <Card title="🌙 데일리 인증 메시지" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>인증 시작 메시지 (17:00)</label>
                      <TextArea
                        rows={3}
                        defaultValue="@everyone 데일리 인증 시간입니다! 🌙&#10;오늘 하루도 수고하셨습니다.&#10;#인증 태그와 함께 인증해주세요!"
                      />
                    </div>
                    <div>
                      <label>인증 마감 메시지 (23:59)</label>
                      <TextArea
                        rows={3}
                        defaultValue="⏰ {날짜} 데일리 인증 마감! ⏰&#10;더 이상 데일리 인증을 받지 않습니다.&#10;지각으로 처리됩니다."
                      />
                    </div>
                    <div>
                      <label>인증 완료 메시지 (정상)</label>
                      <TextArea
                        rows={3}
                        defaultValue="✅ {팀이름} 데일리 인증 완료!&#10;📅{n}일차 정상&#10;👤{사용자 디스코드 아이디}"
                      />
                    </div>
                    <div>
                      <label>인증 완료 메시지 (지각)</label>
                      <TextArea
                        rows={3}
                        defaultValue="⏳ {팀이름} 데일리 인증 완료!&#10;📅{n}일차 지각&#10;👤{사용자 디스코드 아이디}"
                      />
                    </div>
                    <div>
                      <label>인증 현황 메시지 (22:00)</label>
                      <TextArea
                        rows={3}
                        defaultValue="@{사용자 디스코드 아이디} {뱃지}&#10;✅⏳❌⬜⬜⬜⬜"
                      />
                    </div>
                  </Space>
                </Card>

                <Card title="🔄 리셋방 메시지" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>부활 대기 이동 메시지</label>
                      <TextArea
                        rows={4}
                        defaultValue="@{사용자} 님, 주간 인증 횟수가 4회 미만입니다.&#10;부활 대기방으로 이동합니다.&#10;아침 3회 + 데일리 3회 이상 인증하면 복귀 가능합니다."
                      />
                    </div>
                    <div>
                      <label>휴식 상태 메시지</label>
                      <TextArea
                        rows={2}
                        defaultValue="휴식 상태이므로, 수하에게 메세지 주세요"
                      />
                    </div>
                    <div>
                      <label>복귀 메시지</label>
                      <TextArea
                        rows={3}
                        defaultValue="🎉 @{사용자} 님, 부활 성공!&#10;원래 팀으로 복귀합니다."
                      />
                    </div>
                  </Space>
                </Card>

                <Card title="🎉 웰컴 메시지" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <label>1:1 컨트롤타워 웰컴 메시지</label>
                      <TextArea
                        rows={8}
                        defaultValue=":star2: 라이프 마스터리 디스코드 – 필독 공지사항&#10;&#10;## :one: 서버 프로필 설정 (필수!)&#10;입장 후 반드시 서버별 프로필 이름을 다음 형식으로 수정해주세요.&#10;&#10;:white_check_mark: 형식: N기_이름&#10;예시) 1기_수하, 9기_정민하"
                      />
                    </div>
                  </Space>
                </Card>

                <Button type="primary">모든 템플릿 저장</Button>
              </Space>
            ),
          },
          {
            key: "team-management",
            label: "팀 관리",
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Alert
                  message="팀 관리"
                  description="챌린지 내 팀을 추가/삭제하고, 각 팀의 디스코드 채널을 관리합니다."
                  type="info"
                  showIcon
                />

                <Card
                  title="👥 팀 목록"
                  size="small"
                  extra={<Button type="primary">+ 팀 추가</Button>}
                >
                  <Table
                    dataSource={[
                      { id: 1, name: "1팀", discordChannelId: "1234567890", memberCount: 8, status: "active" },
                      { id: 2, name: "2팀", discordChannelId: "1234567891", memberCount: 7, status: "active" },
                      { id: 3, name: "3팀", discordChannelId: "1234567892", memberCount: 9, status: "active" },
                      { id: 4, name: "4팀", discordChannelId: "1234567893", memberCount: 6, status: "active" },
                      { id: 5, name: "5팀", discordChannelId: "1234567894", memberCount: 8, status: "active" },
                    ]}
                    rowKey="id"
                    pagination={false}
                  >
                    <Table.Column
                      dataIndex="name"
                      title="팀명"
                      width={120}
                    />
                    <Table.Column
                      dataIndex="discordChannelId"
                      title="디스코드 채널 ID"
                      render={(channelId) => (
                        <Input
                          defaultValue={channelId}
                          placeholder="채널 ID를 입력하세요"
                          style={{ width: 300 }}
                        />
                      )}
                    />
                    <Table.Column
                      dataIndex="memberCount"
                      title="팀원 수"
                      width={100}
                      align="center"
                      render={(count) => (
                        <Badge count={count} showZero color="blue" />
                      )}
                    />
                    <Table.Column
                      dataIndex="status"
                      title="상태"
                      width={100}
                      render={(status) => (
                        <Tag color={status === "active" ? "green" : "red"}>
                          {status === "active" ? "활성" : "비활성"}
                        </Tag>
                      )}
                    />
                    <Table.Column
                      title="작업"
                      render={() => (
                        <Space>
                          <Button size="small" type="primary">저장</Button>
                          <Button size="small">참여자 관리</Button>
                          <Button size="small" danger>삭제</Button>
                        </Space>
                      )}
                    />
                  </Table>
                </Card>

                <Card title="⚙️ 팀 설정" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <strong>팀 자동 배정</strong>
                      <div style={{ marginTop: 8 }}>
                        <Switch defaultChecked />
                        <span style={{ marginLeft: 8 }}>
                          새 참여자 등록시 자동으로 팀을 배정합니다
                        </span>
                      </div>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        가장 인원이 적은 팀에 우선 배정됩니다
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <strong>팀별 최대 인원</strong>
                      <div style={{ marginTop: 8 }}>
                        <InputNumber
                          defaultValue={10}
                          min={1}
                          max={50}
                          addonAfter="명"
                          style={{ width: 200 }}
                        />
                      </div>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        팀당 최대 수용 가능한 인원 수
                      </div>
                    </div>
                  </Space>
                </Card>
              </Space>
            ),
          },

        ]}
      />
    </Show>
  );
};
