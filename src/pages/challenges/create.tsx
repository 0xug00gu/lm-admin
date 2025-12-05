import { Create, useForm } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Form, Input, DatePicker, InputNumber, Card, Divider, Alert, Switch, message, Select, Space, Button, Table, Modal, Tag } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { getPocketBaseInstance } from "../../providers/pocketbaseDataProvider";
import { api } from "../../config/env";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 시간 선택 컴포넌트 (오전/오후 + 1~12시)
const TimeSelector = ({ value, onChange }: { value?: { period: string; hour: number }; onChange?: (val: { period: string; hour: number }) => void }) => {
  const currentValue = value || { period: "오전", hour: 5 };

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}시`,
    value: i + 1,
  }));

  return (
    <Space>
      <Select
        value={currentValue.period}
        onChange={(period) => onChange?.({ ...currentValue, period })}
        style={{ width: 80 }}
        options={[
          { label: "오전", value: "오전" },
          { label: "오후", value: "오후" },
        ]}
      />
      <Select
        value={currentValue.hour}
        onChange={(hour) => onChange?.({ ...currentValue, hour })}
        style={{ width: 80 }}
        options={hourOptions}
      />
    </Space>
  );
};

// 오전/오후 + 시간을 24시간제로 변환
const convertTo24Hour = (period: string, hour: number): number => {
  if (period === "오전") {
    return hour === 12 ? 0 : hour;
  } else {
    return hour === 12 ? 12 : hour + 12;
  }
};

// 24시간제를 오전/오후 + 시간으로 변환
const convertFrom24Hour = (hour24: number): { period: string; hour: number } => {
  if (hour24 === 0) return { period: "오전", hour: 12 };
  if (hour24 < 12) return { period: "오전", hour: hour24 };
  if (hour24 === 12) return { period: "오후", hour: 12 };
  return { period: "오후", hour: hour24 - 12 };
};

export const ChallengeCreate = () => {
  const [challengeCategories, setChallengeCategories] = useState<any[]>([]);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [discordCategories, setDiscordCategories] = useState<any[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // 채널 관리
  const [channelsToCreate, setChannelsToCreate] = useState<any[]>([]);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [channelForm] = Form.useForm();

  // 디스코드 사용자 목록
  const { data: discordUsersData } = useList({
    resource: "discord_users",
    pagination: {
      mode: "off",
    },
  });
  const discordUsers = discordUsersData?.data || [];


  const { formProps, saveButtonProps, form } = useForm({
    redirect: false, // 자동 리다이렉트 비활성화
  });

  // challenge_category 테이블 데이터 가져오기
  const { data: challengeCategoriesData } = useList({
    resource: "challenge_category",
    pagination: {
      mode: "off",
    },
  });

  useEffect(() => {
    if (challengeCategoriesData?.data) {
      setChallengeCategories(challengeCategoriesData.data);
    }
  }, [challengeCategoriesData]);

  // 컴포넌트 마운트 시 길드 목록 가져오기
  useEffect(() => {
    fetchGuilds();
  }, []);

  // 길드 목록 가져오기
  const fetchGuilds = async () => {
    try {
      const response = await fetch(api.discord.guilds());
      const result = await response.json();
      if (result.success) {
        setGuilds(result.data);
      }
    } catch (error) {
      console.error("길드 목록 가져오기 실패:", error);
    }
  };

  // 디스코드 카테고리 목록 가져오기
  const fetchDiscordCategories = async (guildId: string) => {
    try {
      const response = await fetch(api.discord.guildCategories(guildId));
      const result = await response.json();
      if (result.success) {
        setDiscordCategories(result.data);
      }
    } catch (error) {
      console.error("디스코드 카테고리 목록 가져오기 실패:", error);
    }
  };

  // 길드 선택 시
  const handleGuildChange = (guildId: string) => {
    setSelectedGuildId(guildId);
    if (guildId) {
      fetchDiscordCategories(guildId);
    } else {
      setDiscordCategories([]);
    }
    channelForm.setFieldsValue({ parent_id: undefined });
  };

  // 채널 추가 (목록에만 추가, 실제 Discord 생성은 챌린지 저장 시)
  const handleAddChannelToList = async () => {
    try {
      const values = await channelForm.validateFields();

      if (!selectedGuildId) {
        message.error("길드를 선택하세요");
        return;
      }

      // 선택된 사용자들의 정보 가져오기
      const selectedUserIds = values.users || [];
      const selectedUsers = discordUsers.filter((user: any) => selectedUserIds.includes(user.id));

      // 목록에만 추가 (Discord 채널은 챌린지 저장 시 생성)
      const newChannel = {
        id: Date.now().toString(), // 임시 ID (프론트 관리용)
        name: values.name,
        guild_id: selectedGuildId,
        type: values.type || "text",
        parent_id: selectedCategoryId || "",
        is_private: values.is_private || false,
        demotion_enabled: values.demotion_enabled || false,
        users: selectedUsers, // 추가할 사용자 목록
      };
      setChannelsToCreate([...channelsToCreate, newChannel]);
      setIsChannelModalOpen(false);
      channelForm.resetFields();
      message.success(`채널 '${newChannel.name}'이(가) 목록에 추가되었습니다.`);
    } catch (error: any) {
      console.error("채널 추가 에러:", error);
      message.error("채널 추가 중 오류가 발생했습니다.");
    }
  };

  // 채널 삭제 (목록에서만 제거 - 아직 Discord에 생성 안 됨)
  const handleRemoveChannelFromList = (id: string) => {
    setChannelsToCreate(channelsToCreate.filter((ch) => ch.id !== id));
    message.success("채널이 목록에서 제거되었습니다.");
  };

  // 제출 중복 방지
  const isSubmitting = useRef(false);

  // Form 제출 시 데이터 변환 - PocketBase 직접 호출로 중복 방지
  const handleFinish = async (values: any) => {
    // 이미 제출 중이면 무시
    if (isSubmitting.current) {
      return;
    }
    isSubmitting.current = true;

    try {
      const pb = await getPocketBaseInstance();
      if (!pb) {
        message.error("DB 연결에 실패했습니다.");
        isSubmitting.current = false;
        return;
      }

      // period가 없으면 에러
      if (!values.period || !values.period[0] || !values.period[1]) {
        message.error("기간을 선택해주세요.");
        isSubmitting.current = false;
        return;
      }

      // 정책 필드들 분리 (항상 생성) - API 스키마에 맞게 변환
      // TimeSelector 값에서 24시간제 시간 추출
      const getHourFrom = (timeValue: { period: string; hour: number } | undefined, defaultHour: number): number => {
        if (!timeValue) return defaultHour;
        return convertTo24Hour(timeValue.period, timeValue.hour);
      };

      const policyFields = {
        name: `${values.name} 정책`,
        morning_start_hour: getHourFrom(values.morning_normal_start, 5),
        morning_end_hour: getHourFrom(values.morning_normal_end, 10),
        morning_late_hour: getHourFrom(values.morning_late_end, 11),
        daily_start_hour: getHourFrom(values.daily_normal_start, 17),
        daily_end_hour: getHourFrom(values.daily_normal_end, 23),
        daily_late_hour: getHourFrom(values.daily_late_end, 1),
        min_weekly_morning: values.revival_min_morning_count || 3,
        min_weekly_daily: values.revival_min_daily_count || 3,
        revival_deadline_days: (values.rest_period_weeks || 2) * 7,
        rest_transition_days: (values.rest_period_weeks || 2) * 7,
        description: values.description || "",
        is_active: true,
      };

      // 챌린지 데이터 생성
      const challengeValues: any = {
        name: values.name,
        start_date: values.period[0].toISOString(),
        finish_date: values.period[1].toISOString(),
        is_active: values.is_active !== undefined ? values.is_active : true,
        demotion_enabled: values.demotion_enabled !== undefined ? values.demotion_enabled : false,
      };

      // guild_id 저장
      if (selectedGuildId) {
        challengeValues.guild_id = selectedGuildId;
      }

      if (typeof values.cardinal_number === 'number' || (values.cardinal_number !== undefined && values.cardinal_number !== null && values.cardinal_number !== "")) {
        challengeValues.cardinal_number = Number(values.cardinal_number);
      }
      if (values.description) {
        challengeValues.description = values.description;
      }
      if (values.challenge_category_id) {
        challengeValues.category_id = values.challenge_category_id;
      }

      // 1. 정책 생성 (PocketBase 직접 호출)
      const policyRecord = await pb.collection("challenge_policies").create(policyFields);

      // 2. 챌린지 생성 (PocketBase 직접 호출)
      const challengeRecord = await pb.collection("challenges").create({
        ...challengeValues,
        policy_id: policyRecord.id,
      });

      // 3. 채널 생성 (있으면) - PocketBase insert 방식 (백엔드 Hook이 Discord 채널 자동 생성)
      if (channelsToCreate.length > 0) {
        for (const channel of channelsToCreate) {
          try {
            // channels 테이블에 insert → 백엔드 Hook이 Discord 채널 자동 생성
            const channelRecord = await pb.collection("channels").create({
              name: channel.name,
              guild_id: channel.guild_id,
              type: channel.type === "text" ? 0 : channel.type === "voice" ? 2 : 0,
              parent_id: channel.parent_id || "",
              is_private: channel.is_private || false,
              challenge_id: challengeRecord.id,
              demotion_enabled: channel.demotion_enabled || false,
            });

            // 4. 채널에 사용자 추가 - channel_members 테이블에 insert
            if (channel.users && channel.users.length > 0) {
              for (const user of channel.users) {
                try {
                  await pb.collection("channel_members").create({
                    channel_id: channelRecord.id,
                    discord_user_id: user.id, // discord_users 테이블의 레코드 ID (relation)
                    role: "member",
                  });
                } catch (memberErr) {
                  console.error("채널 멤버 추가 중 에러:", memberErr);
                }
              }
            }
          } catch (err) {
            console.error("채널 생성 중 에러:", err);
          }
        }
      }

      message.success("챌린지가 생성되었습니다.");
      window.location.href = "/challenges";

    } catch (error: any) {
      console.error("생성 실패:", error);

      let errorMessage = "생성에 실패했습니다.";
      if (error?.data?.data) {
        const fieldErrors = error.data.data;
        const errorMessages: string[] = [];
        for (const [field, err] of Object.entries(fieldErrors) as [string, any][]) {
          let fieldName = field;
          if (field === "name") fieldName = "챌린지명";
          let errMsg = err.message || err.code;
          if (err.code === "validation_not_unique") {
            errMsg = "이미 사용 중인 값입니다.";
          }
          errorMessages.push(`${fieldName}: ${errMsg}`);
        }
        errorMessage = errorMessages.join("\n");
      } else if (error?.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage, 10);
      isSubmitting.current = false;
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          is_active: true,
          demotion_enabled: false,
          morning_normal_start: convertFrom24Hour(5),
          morning_normal_end: convertFrom24Hour(10),
          morning_late_end: convertFrom24Hour(11),
          daily_normal_start: convertFrom24Hour(17),
          daily_normal_end: convertFrom24Hour(23),
          daily_late_end: convertFrom24Hour(12),
          min_weekly_count: 4,
          revival_min_morning_count: 3,
          revival_min_daily_count: 3,
          rest_period_weeks: 2,
        }}
      >
        {/* 챌린지 카테고리 선택 */}
        <Card title="챌린지 카테고리 선택" style={{ marginBottom: 24 }}>
          <Form.Item
            label="챌린지 카테고리"
            name="challenge_category_id"
            rules={[{ required: true, message: "챌린지 카테고리를 선택해주세요" }]}
          >
            <Select
              placeholder="카테고리를 선택하세요"
              options={challengeCategories.map((cat: any) => ({
                label: cat.name || cat.id,
                value: cat.id,
              }))}
              size="large"
              style={{ width: "100%" }}
            />
          </Form.Item>

        </Card>

        {/* 기본 정보 */}
        <Card title="기본 정보" style={{ marginBottom: 24 }}>
          <Form.Item
            label="챌린지명"
            name="name"
            rules={[{ required: true, message: "챌린지명을 입력해주세요" }]}
          >
            <Input placeholder="챌린지명을 입력하세요" />
          </Form.Item>

          <Form.Item
            label="기수"
            name="cardinal_number"
            help="예: 1, 2, 3... (숫자만 입력 가능)"
          >
            <InputNumber
              placeholder="기수를 입력하세요 (숫자만)"
              min={1}
              max={999}
              style={{ width: 200 }}
              addonAfter="기"
              precision={0}
            />
          </Form.Item>

          <Form.Item
            label="기간"
            name="period"
            rules={[{ required: true, message: "기간을 선택해주세요" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="설명" name="description">
            <TextArea rows={4} placeholder="챌린지 설명을 입력하세요" />
          </Form.Item>

          <Form.Item
            label="활성 상태"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
          </Form.Item>
        </Card>

        {/* 아침 인증 시간 설정 */}
        <Card title="☀️ 아침 인증 시간 설정" style={{ marginBottom: 24 }}>
          <Form.Item
            label="정상 인증 시작 시간"
            name="morning_normal_start"
          >
            <TimeSelector />
          </Form.Item>

          <Form.Item
            label="정상 인증 종료 시간"
            name="morning_normal_end"
          >
            <TimeSelector />
          </Form.Item>

          <Form.Item
            label="지각 인증 종료 시간"
            name="morning_late_end"
            help="이 시간까지는 지각으로 인정"
          >
            <TimeSelector />
          </Form.Item>
        </Card>

        {/* 데일리 인증 시간 설정 */}
        <Card title="🌙 데일리 인증 시간 설정" style={{ marginBottom: 24 }}>
          <Form.Item
            label="정상 인증 시작 시간"
            name="daily_normal_start"
          >
            <TimeSelector />
          </Form.Item>

          <Form.Item
            label="정상 인증 종료 시간"
            name="daily_normal_end"
          >
            <TimeSelector />
          </Form.Item>

          <Form.Item
            label="지각 인증 종료 시간"
            name="daily_late_end"
            help="익일 새벽까지 지각으로 인정"
          >
            <TimeSelector />
          </Form.Item>
        </Card>

        {/* 인증 정책 설정 */}
        <Card title="⚙️ 인증 정책 설정" style={{ marginBottom: 24 }}>
          <Form.Item
            label="리셋방 기능 활성화"
            name="demotion_enabled"
            valuePropName="checked"
            help="리셋방 기능을 활성화하면 주간 최소 인증 횟수 미달 시 리셋방으로 이동합니다"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Form.Item
            label="주간 최소 인증 횟수"
            name="min_weekly_count"
            help="주간 최소 인증 횟수 미만 시 리셋방으로 이동합니다 (아침+데일리 합산)"
          >
            <InputNumber
              min={0}
              max={14}
              placeholder="4"
              style={{ width: 200 }}
              addonAfter="회"
              precision={0}
            />
          </Form.Item>

          <Form.Item
            label="부활 최소 인증 횟수 - 아침"
            name="revival_min_morning_count"
            help="리셋방에서 주간 아침 인증 횟수"
          >
            <InputNumber
              min={0}
              max={7}
              placeholder="3"
              style={{ width: 200 }}
              addonAfter="회"
              precision={0}
            />
          </Form.Item>

          <Form.Item
            label="부활 최소 인증 횟수 - 데일리"
            name="revival_min_daily_count"
            help="리셋방에서 주간 데일리 인증 횟수"
          >
            <InputNumber
              min={0}
              max={7}
              placeholder="3"
              style={{ width: 200 }}
              addonAfter="회"
              precision={0}
            />
          </Form.Item>

          <Form.Item
            label="휴식방 강등 기간"
            name="rest_period_weeks"
            help="리셋방에서 이 기간 내 미복귀 시 휴식방으로 이동합니다"
          >
            <InputNumber
              min={1}
              max={4}
              placeholder="2"
              style={{ width: 200 }}
              addonAfter="주"
              precision={0}
            />
          </Form.Item>
        </Card>

        {/* 채널 관리 */}
        <Card title="채널 관리" style={{ marginBottom: 24 }}>
          <Alert
            message="채널 설정"
            description="챌린지와 연결할 Discord 채널을 추가하세요. 챌린지 저장 시 Discord에 채널이 생성됩니다."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item label="Discord 길드 (서버)" style={{ marginBottom: 16 }}>
            <Select
              placeholder="길드를 선택하세요"
              onChange={handleGuildChange}
              value={selectedGuildId}
              style={{ width: 300 }}
              options={guilds.map((guild) => ({
                label: `${guild.name} (멤버: ${guild.member_count}명)`,
                value: guild.id,
              }))}
            />
          </Form.Item>

          <Form.Item label="Discord 카테고리" style={{ marginBottom: 16 }}>
            <Select
              placeholder="카테고리를 선택하세요 (선택사항)"
              disabled={!selectedGuildId}
              allowClear
              style={{ width: 300 }}
              value={selectedCategoryId || undefined}
              onChange={(value) => setSelectedCategoryId(value || "")}
              options={discordCategories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </Form.Item>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setIsChannelModalOpen(true)}
            style={{ marginBottom: 16 }}
            disabled={!selectedGuildId}
          >
            채널 추가
          </Button>

          {channelsToCreate.length > 0 && (
            <Table
              dataSource={channelsToCreate}
              rowKey="id"
              pagination={false}
              size="small"
            >
              <Table.Column dataIndex="name" title="채널명" />
              <Table.Column dataIndex="type" title="타입" />
              <Table.Column
                dataIndex="demotion_enabled"
                title="리셋방"
                render={(v) => (v ? "O" : "-")}
              />
              <Table.Column
                dataIndex="users"
                title="참여 사용자"
                render={(users: any[]) => (
                  users && users.length > 0 ? (
                    <Space wrap size={[0, 4]}>
                      {users.slice(0, 3).map((user: any) => (
                        <Tag key={user.id} icon={<UserOutlined />} color="blue">
                          {user.name || user.username}
                        </Tag>
                      ))}
                      {users.length > 3 && (
                        <Tag color="default">+{users.length - 3}명</Tag>
                      )}
                    </Space>
                  ) : "-"
                )}
              />
              <Table.Column
                title="작업"
                render={(_, record: any) => (
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveChannelFromList(record.id)}
                  />
                )}
              />
            </Table>
          )}

          {channelsToCreate.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", padding: 20 }}>
              추가된 채널이 없습니다. 채널 추가 버튼을 눌러 채널을 추가하세요.
            </div>
          )}
        </Card>

        {/* 채널 추가 Modal */}
        <Modal
          title="채널 추가"
          open={isChannelModalOpen}
          onOk={handleAddChannelToList}
          onCancel={() => {
            setIsChannelModalOpen(false);
            channelForm.resetFields();
          }}
          okText="추가"
          cancelText="취소"
        >
          <Form form={channelForm} layout="vertical">
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
              initialValue="text"
            >
              <Select
                options={[
                  { label: "텍스트 채널", value: "text" },
                  { label: "음성 채널", value: "voice" },
                  { label: "공지 채널", value: "announcement" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="is_private"
              label="비공개 채널"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="demotion_enabled"
              label="리셋방 기능"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
            <Divider />
            <Form.Item
              name="users"
              label="참여 사용자"
              help="채널에 추가할 사용자를 선택하세요 (선택사항)"
            >
              <Select
                mode="multiple"
                placeholder="사용자를 선택하세요"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={discordUsers.map((user: any) => ({
                  label: `${user.name || "이름없음"} (${user.username || "ID없음"})`,
                  value: user.id,
                }))}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Form>
    </Create>
  );
};
