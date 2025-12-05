import dayjs from "dayjs";
import { Show } from "@refinedev/antd";
import { useShow, useCreate, useDelete, useList, useUpdate, useNavigation } from "@refinedev/core";
import { getPocketBaseInstance } from "../../providers/pocketbaseDataProvider";
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
  UserOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";

const { TextArea } = Input;

export const ChallengeShow = () => {
  const { queryResult } = useShow({
    resource: "challenges",
    meta: {
      expand: "policy_id", // 정책 정보도 함께 가져오기
    },
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { list } = useNavigation();

  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [channelForm] = Form.useForm();
  const [editChannelForm] = Form.useForm();

  // 멤버 관리 상태
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [channelMembers, setChannelMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addMemberForm] = Form.useForm();

  // 인증 설정 로컬 상태
  const [demotionEnabled, setDemotionEnabled] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { mutate: createChannel } = useCreate();
  const { mutate: deleteChannel } = useDelete();
  const { mutate: updateChannel } = useUpdate();
  const { mutate: updateChallenge } = useUpdate();
  const { mutate: deleteChallenge } = useDelete();
  const { mutate: updatePolicy } = useUpdate();
  const { mutate: createPolicy } = useCreate();

  // record가 로드되면 초기값 설정
  useEffect(() => {
    if (record) {
      setDemotionEnabled(record.demotion_enabled || false);
      setHasChanges(false);
    }
  }, [record]);

  // 변경사항 감지
  useEffect(() => {
    if (record) {
      const changed = demotionEnabled !== (record.demotion_enabled || false);
      setHasChanges(changed);
    }
  }, [demotionEnabled, record]);

  // 채널 데이터 가져오기 (현재 챌린지에 연결된 채널만)
  const { data: channelsData, refetch: refetchChannels } = useList({
    resource: "channels",
    filters: [
      {
        field: "challenge_id",
        operator: "eq",
        value: record?.id,
      },
    ],
    pagination: {
      mode: "off",
    },
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  const channels = channelsData?.data || [];

  // 디스코드 사용자 목록 가져오기
  const { data: discordUsersData } = useList({
    resource: "discord_users",
    pagination: {
      mode: "off",
    },
  });
  const discordUsers = discordUsersData?.data || [];

  // weekly_stats 데이터 가져오기
  const { data: weeklyStatsData, isLoading: isWeeklyStatsLoading } = useList({
    resource: "weekly_stats",
    pagination: {
      mode: "off",
    },
  });

  const weeklyStats = weeklyStatsData?.data || [];

  // verifications 데이터 가져오기 (일별 인증 데이터)
  const { data: verificationsData, isLoading: isVerificationsLoading } = useList({
    resource: "verifications",
    pagination: {
      mode: "off",
    },
  });

  const verifications = verificationsData?.data || [];

  // users 데이터 가져오기
  const { data: usersData, isLoading: isUsersLoading } = useList({
    resource: "users",
    pagination: {
      mode: "off",
    },
  });

  const users = usersData?.data || [];

  // expand된 policy 데이터 사용 (challenges 테이블의 policy_id relation)
  const policy = record?.expand?.policy_id;

  // 정책 새로고침 함수 (queryResult를 refetch)
  const refetchPolicy = queryResult.refetch;

  // 팀 필터 상태
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  // 현재 주의 시작일(일요일)과 종료일(토요일) 계산
  const getWeekRange = () => {
    const now = dayjs();
    const dayOfWeek = now.day(); // 0: 일요일, 1: 월요일, ...
    const weekStart = now.subtract(dayOfWeek, 'day').startOf('day');
    const weekEnd = weekStart.add(6, 'day').endOf('day');
    return { weekStart, weekEnd };
  };

  // verifications 데이터를 테이블 형태로 변환 (1인당 2 row)
  const getTableData = () => {
    const { weekStart, weekEnd } = getWeekRange();

    // 현재 주의 verifications만 필터링
    const weekVerifications = verifications.filter((v: any) => {
      const verifiedDate = dayjs(v.created);
      return verifiedDate.isAfter(weekStart) && verifiedDate.isBefore(weekEnd);
    });

    // user별로 데이터 그룹화
    const userMap = new Map();

    users.forEach((user: any) => {
      const userVerifications = weekVerifications.filter((v: any) => v.user_id === user.id);

      // 요일별 인증 상태 계산
      const dayStatus = {
        sunday: { morning: false, daily: false },
        monday: { morning: false, daily: false },
        tuesday: { morning: false, daily: false },
        wednesday: { morning: false, daily: false },
        thursday: { morning: false, daily: false },
        friday: { morning: false, daily: false },
        saturday: { morning: false, daily: false },
      };

      const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      userVerifications.forEach((v: any) => {
        const verifiedDate = dayjs(v.created);
        const dayIndex = verifiedDate.day();
        const dayName = dayMap[dayIndex];
        const verificationType = v.verification_type || v.type; // 필드명이 다를 수 있음

        if (verificationType === 'morning') {
          dayStatus[dayName as keyof typeof dayStatus].morning = true;
        } else if (verificationType === 'daily') {
          dayStatus[dayName as keyof typeof dayStatus].daily = true;
        }
      });

      // 연속 인증 계산 (임시로 0으로 설정)
      const streak = 0;

      userMap.set(user.id, {
        userId: user.id,
        name: user.name || user.discord_username || user.discord_id || 'Unknown',
        team: user.team || '팀 없음',
        dayStatus,
        streak,
      });
    });

    // 1인당 2 row 생성
    const tableData: any[] = [];
    userMap.forEach((userData) => {
      // 아침 row
      tableData.push({
        id: `${userData.userId}-morning`,
        userId: userData.userId,
        name: userData.name,
        team: userData.team,
        type: 'morning',
        sunday: userData.dayStatus.sunday.morning,
        monday: userData.dayStatus.monday.morning,
        tuesday: userData.dayStatus.tuesday.morning,
        wednesday: userData.dayStatus.wednesday.morning,
        thursday: userData.dayStatus.thursday.morning,
        friday: userData.dayStatus.friday.morning,
        saturday: userData.dayStatus.saturday.morning,
        streak: userData.streak,
      });

      // 저녁 row
      tableData.push({
        id: `${userData.userId}-daily`,
        userId: userData.userId,
        type: 'daily',
        sunday: userData.dayStatus.sunday.daily,
        monday: userData.dayStatus.monday.daily,
        tuesday: userData.dayStatus.tuesday.daily,
        wednesday: userData.dayStatus.wednesday.daily,
        thursday: userData.dayStatus.thursday.daily,
        friday: userData.dayStatus.friday.daily,
        saturday: userData.dayStatus.saturday.daily,
      });
    });

    // 팀 필터링
    if (selectedTeam !== "all") {
      return tableData.filter((item) => item.team === selectedTeam);
    }

    return tableData;
  };

  // 챌린지의 채널 정보 가져오기 (guild_id는 챌린지에서, parent_id는 채널에서)
  const getChallengeChannelInfo = () => {
    // 챌린지에 guild_id가 있으면 사용
    if (record?.guild_id) {
      return {
        guild_id: record.guild_id,
        parent_id: channels?.[0]?.parent_id || "",
      };
    }
    // 없으면 기존 채널에서 가져오기 (하위호환)
    if (channels && channels.length > 0) {
      return {
        guild_id: channels[0].guild_id,
        parent_id: channels[0].parent_id || "",
      };
    }
    return null;
  };

  // 채널 추가 (PocketBase insert 방식 + 멤버 추가)
  const handleAddChannel = async () => {
    try {
      const values = await channelForm.validateFields();

      const channelInfo = getChallengeChannelInfo();
      if (!channelInfo) {
        message.error("챌린지에 연결된 채널이 없어 길드를 확인할 수 없습니다.");
        return;
      }

      const pb = getPocketBaseInstance();
      if (!pb) {
        message.error("DB 연결에 실패했습니다.");
        return;
      }

      // 1. channels 테이블에 insert → 백엔드 Hook이 Discord 채널 자동 생성
      // guild_id와 parent_id는 기존 채널의 것을 따라감
      const channelRecord = await pb.collection("channels").create({
        name: values.name,
        guild_id: channelInfo.guild_id,
        type: values.type === "text" ? 0 : values.type === "voice" ? 2 : 0,
        parent_id: channelInfo.parent_id,
        is_private: values.is_private || false,
        is_active: true,
        demotion_enabled: values.demotion_enabled || false,
        challenge_id: record?.id,
      });

      // 2. 선택된 멤버들 추가 - channel_members 테이블에 insert → 백엔드 Hook이 Discord 채널에 멤버 초대
      const selectedUserIds = values.users || [];
      if (selectedUserIds.length > 0) {
        for (const userId of selectedUserIds) {
          try {
            await pb.collection("channel_members").create({
              channel_id: channelRecord.id,
              discord_user_id: userId, // discord_users 테이블의 레코드 ID (relation)
              role: "member",
            });
          } catch (memberErr) {
            console.error("채널 멤버 추가 중 에러:", memberErr);
          }
        }
      }

      message.success("채널이 추가되었습니다.");
      setIsChannelModalOpen(false);
      channelForm.resetFields();
      refetchChannels();
    } catch (error: any) {
      console.error("채널 추가 실패:", error);
      const errorMessage = error?.data?.message || error?.message || "채널 추가에 실패했습니다.";
      message.error(errorMessage);
    }
  };

  // 채널 삭제 (DB 삭제 → 백엔드 Hook이 Discord 채널 자동 삭제)
  const handleDeleteChannel = (id: string) => {
    // 삭제할 채널 정보 찾기
    const channelToDelete = channels.find((ch: any) => ch.id === id);

    Modal.confirm({
      title: "⚠️ 채널을 삭제하시겠습니까?",
      content: (
        <div>
          <p><strong>"{channelToDelete?.name}"</strong> 채널을 삭제합니다.</p>
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            Discord 서버에서 해당 채널이 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
      ),
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        // DB에서 채널 삭제 → 백엔드 Hook이 Discord 채널 자동 삭제
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
            onError: (error: any) => {
              console.error("채널 삭제 실패:", error);
              message.error("채널 삭제에 실패했습니다.");
            },
          }
        );
      },
    });
  };

  // 채널 수정 Modal 열기
  const handleEditChannel = (channel: any) => {
    setEditingChannel(channel);
    editChannelForm.setFieldsValue({
      channel_id: channel.channel_id,
      name: channel.name,
      type: channel.type || "text",
      topic: channel.topic,
      is_private: channel.is_private,
      is_active: channel.is_active,
      demotion_enabled: channel.demotion_enabled,
    });
    setIsEditChannelModalOpen(true);
  };

  // 채널 수정 저장
  const handleUpdateChannel = async () => {
    try {
      const values = await editChannelForm.validateFields();

      updateChannel(
        {
          resource: "channels",
          id: editingChannel?.id,
          values: {
            channel_id: values.channel_id,
            name: values.name,
            type: values.type,
            topic: values.topic || "",
            is_private: values.is_private || false,
            is_active: values.is_active !== undefined ? values.is_active : true,
            demotion_enabled: values.demotion_enabled || false,
          },
        },
        {
          onSuccess: () => {
            message.success("채널이 수정되었습니다.");
            setIsEditChannelModalOpen(false);
            setEditingChannel(null);
            editChannelForm.resetFields();
            refetchChannels();
          },
          onError: (error: any) => {
            console.error("채널 수정 실패:", error);
            message.error("채널 수정에 실패했습니다.");
          },
        }
      );
    } catch (error) {
      message.error("채널 수정 중 오류가 발생했습니다.");
    }
  };

  // 리셋방 on/off 토글 (로컬 상태만 변경)
  const handleDemotionToggle = (checked: boolean) => {
    setDemotionEnabled(checked);
  };

  // 설정 저장
  const handleSaveSettings = () => {
    // 1. challenges 테이블 업데이트
    updateChallenge(
      {
        resource: "challenges",
        id: record?.id,
        values: {
          demotion_enabled: demotionEnabled,
        },
      },
      {
        onSuccess: () => {
          console.log("✅ 챌린지 업데이트 성공");

          // 2. challenge_policies 테이블도 업데이트 (있으면 업데이트, 없으면 생성)
          if (policy?.id) {
            // 정책이 이미 있으면 업데이트
            updatePolicy(
              {
                resource: "challenge_policies",
                id: policy.id,
                values: {
                  // 여기에 업데이트할 정책 필드 추가
                  // 예: min_weekly_count, revival_min_morning_count 등
                },
              },
              {
                onSuccess: () => {
                  console.log("✅ 정책 업데이트 성공");
                  message.success("설정이 저장되었습니다.");
                  queryResult.refetch();
                  refetchPolicy();
                  setHasChanges(false);
                },
                onError: (error) => {
                  console.error("❌ 정책 업데이트 실패:", error);
                  message.warning("챌린지는 저장되었으나 정책 저장에 실패했습니다.");
                },
              }
            );
          } else {
            // 정책이 없으면 새로 생성
            createPolicy(
              {
                resource: "challenge_policies",
                values: {
                  challenge_id: record?.id,
                  // 여기에 생성할 정책 필드 추가
                },
              },
              {
                onSuccess: () => {
                  console.log("✅ 정책 생성 성공");
                  message.success("설정이 저장되었습니다.");
                  queryResult.refetch();
                  refetchPolicy();
                  setHasChanges(false);
                },
                onError: (error) => {
                  console.error("❌ 정책 생성 실패:", error);
                  message.warning("챌린지는 저장되었으나 정책 생성에 실패했습니다.");
                },
              }
            );
          }
        },
        onError: (error) => {
          console.error("❌ 챌린지 업데이트 실패:", error);
          message.error("설정 저장에 실패했습니다.");
        },
      }
    );
  };

  // 챌린지 삭제 (관련 채널, 채널 멤버도 함께 삭제)
  const handleDeleteChallenge = () => {
    Modal.confirm({
      title: "⚠️ 챌린지를 삭제하시겠습니까?",
      content: (
        <div>
          <p>해당 작업은 되돌릴 수 없습니다.</p>
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            챌린지와 연결된 모든 채널, 채널 멤버가 삭제되며, Discord 서버의 채널도 영구적으로 삭제됩니다.
          </p>
        </div>
      ),
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        const pb = getPocketBaseInstance();
        if (!pb) {
          message.error("DB 연결에 실패했습니다.");
          return;
        }

        try {
          // 1. 챌린지에 연결된 모든 채널의 멤버 삭제
          for (const channel of channels) {
            try {
              const members = await pb.collection("channel_members").getFullList({
                filter: `channel_id='${channel.id}'`,
              });
              for (const member of members) {
                await pb.collection("channel_members").delete(member.id);
              }
            } catch (err) {
              console.error("채널 멤버 삭제 에러:", err);
            }
          }

          // 2. 챌린지에 연결된 모든 채널 삭제 → 백엔드 Hook이 Discord 채널 자동 삭제
          for (const channel of channels) {
            try {
              await pb.collection("channels").delete(channel.id);
            } catch (err) {
              console.error("채널 삭제 에러:", err);
            }
          }

          // 3. 챌린지 삭제
          deleteChallenge(
            {
              resource: "challenges",
              id: record?.id,
            },
            {
              onSuccess: () => {
                message.success("챌린지가 삭제되었습니다.");
                list("challenges");
              },
              onError: () => {
                message.error("챌린지 삭제에 실패했습니다.");
              },
            }
          );
        } catch (error) {
          console.error("챌린지 삭제 중 에러:", error);
          message.error("챌린지 삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  // 채널 멤버 목록 가져오기
  const fetchChannelMembers = async (channel: any) => {
    if (!channel?.id) {
      message.error("채널 정보가 없습니다.");
      return;
    }

    setLoadingMembers(true);
    try {
      const pb = getPocketBaseInstance();
      if (!pb) {
        message.error("DB 연결에 실패했습니다.");
        setLoadingMembers(false);
        return;
      }

      // PocketBase에서 channel_members 조회 (expand로 discord_user 정보 포함)
      const result = await pb.collection("channel_members").getFullList({
        filter: `channel_id='${channel.id}'`,
        expand: "discord_user_id",
      });

      setChannelMembers(result);
    } catch (error: any) {
      console.error("멤버 목록 가져오기 실패:", error);
      // 403 에러인 경우 API Rules 안내
      if (error?.status === 403) {
        message.error("권한이 없습니다. PocketBase Admin에서 channel_members 컬렉션의 API Rules를 설정하세요.");
      } else {
        message.error("멤버 목록을 가져오는데 실패했습니다.");
      }
      setChannelMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // 채널 멤버 보기 Modal 열기
  const handleViewMembers = async (channel: any) => {
    setSelectedChannel(channel);
    setIsMemberModalOpen(true);
    await fetchChannelMembers(channel);
  };

  // 채널에 멤버 추가 (PocketBase insert 방식)
  const handleAddMember = async () => {
    try {
      const values = await addMemberForm.validateFields();

      if (!selectedChannel?.id) {
        message.error("채널 정보가 없습니다.");
        return;
      }

      const pb = getPocketBaseInstance();
      if (!pb) {
        message.error("DB 연결에 실패했습니다.");
        return;
      }

      // 선택한 유저의 discord_id 찾기
      const selectedUser = discordUsers.find((user: any) => user.id === values.user_record_id);

      if (!selectedUser?.discord_id) {
        message.error("선택한 유저의 Discord ID를 찾을 수 없습니다.");
        return;
      }

      // channel_members 테이블에 insert → 백엔드 Hook이 Discord 권한 자동 추가
      await pb.collection("channel_members").create({
        channel_id: selectedChannel.id,
        discord_user_id: selectedUser.id,
        role: values.role || "member",
      });

      message.success("멤버가 추가되었습니다.");
      setIsAddMemberModalOpen(false);
      addMemberForm.resetFields();
      // 멤버 목록 새로고침
      await fetchChannelMembers(selectedChannel);
    } catch (error: any) {
      console.error("멤버 추가 에러:", error);
      const errorMessage = error?.data?.message || error?.message || "멤버 추가 중 오류가 발생했습니다.";
      message.error(errorMessage);
    }
  };

  // 채널에서 멤버 제거 (PocketBase delete 방식)
  const handleRemoveMember = (member: any) => {
    const userName = member.expand?.discord_user_id?.name || member.expand?.discord_user_id?.username || "알 수 없음";

    Modal.confirm({
      title: "멤버를 채널에서 제거하시겠습니까?",
      content: `${userName} 님을 이 채널에서 제거합니다.`,
      okText: "제거",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        const pb = getPocketBaseInstance();
        if (!pb) {
          message.error("DB 연결에 실패했습니다.");
          return;
        }

        try {
          // channel_members 테이블에서 삭제 → 백엔드 Hook이 Discord 권한 자동 제거
          await pb.collection("channel_members").delete(member.id);

          message.success("멤버가 제거되었습니다.");
          // 멤버 목록 새로고침
          await fetchChannelMembers(selectedChannel);
        } catch (error: any) {
          console.error("멤버 제거 에러:", error);
          const errorMessage = error?.data?.message || error?.message || "멤버 제거 중 오류가 발생했습니다.";
          message.error(errorMessage);
        }
      },
    });
  };

  return (
    <Show
      isLoading={isLoading}
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteChallenge}
          >
            챌린지 삭제
          </Button>
        </>
      )}
    >
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
                    {/* 리셋방 on/off */}
                    <div>
                      <strong>리셋방 기능</strong>
                      <div style={{ marginTop: 8 }}>
                        <Switch
                          checked={demotionEnabled}
                          onChange={handleDemotionToggle}
                          checkedChildren="ON"
                          unCheckedChildren="OFF"
                        />
                      </div>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        리셋방 기능을 활성화하면 주간 최소 인증 횟수 미달 시 리셋방으로 이동합니다
                      </div>
                    </div>
                    <Divider />
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

                <Button type="primary" onClick={handleSaveSettings} disabled={!hasChanges}>
                  설정 저장
                </Button>
              </Space>
            ),
          },

          {
            key: "discord",
            label: "팀 관리",
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
                      width={220}
                      render={(_, channelRecord: any) => (
                        <Space>
                          <Button
                            size="small"
                            icon={<UserOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMembers(channelRecord);
                            }}
                          >
                            멤버
                          </Button>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditChannel(channelRecord);
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChannel(channelRecord.id);
                            }}
                          >
                            삭제
                          </Button>
                        </Space>
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
                  title="채널 추가"
                  open={isChannelModalOpen}
                  onOk={handleAddChannel}
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

                {/* 채널 수정 Modal */}
                <Modal
                  title="채널 수정"
                  open={isEditChannelModalOpen}
                  onOk={handleUpdateChannel}
                  onCancel={() => {
                    setIsEditChannelModalOpen(false);
                    setEditingChannel(null);
                    editChannelForm.resetFields();
                  }}
                  okText="저장"
                  cancelText="취소"
                >
                  <Form form={editChannelForm} layout="vertical">
                    <Form.Item
                      name="channel_id"
                      label="Discord 채널 ID"
                      rules={[{ required: true, message: "채널 ID를 입력하세요" }]}
                    >
                      <Input placeholder="Discord 채널 ID" />
                    </Form.Item>
                    <Form.Item
                      name="name"
                      label="채널명"
                      rules={[{ required: true, message: "채널명을 입력하세요" }]}
                    >
                      <Input placeholder="채널명" />
                    </Form.Item>
                    <Form.Item
                      name="type"
                      label="채널 타입"
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
                      name="topic"
                      label="채널 설명"
                    >
                      <Input.TextArea placeholder="채널 설명 (선택사항)" rows={2} />
                    </Form.Item>
                    <Form.Item
                      name="is_private"
                      label="비공개 채널"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      name="is_active"
                      label="활성 상태"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="활성" unCheckedChildren="비활성" />
                    </Form.Item>
                    <Form.Item
                      name="demotion_enabled"
                      label="리셋방 기능"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Form>
                </Modal>

                {/* 채널 멤버 목록 Modal */}
                <Modal
                  title={`${selectedChannel?.name || "채널"} 멤버 관리`}
                  open={isMemberModalOpen}
                  onCancel={() => {
                    setIsMemberModalOpen(false);
                    setSelectedChannel(null);
                    setChannelMembers([]);
                  }}
                  footer={[
                    <Button key="close" onClick={() => {
                      setIsMemberModalOpen(false);
                      setSelectedChannel(null);
                      setChannelMembers([]);
                    }}>
                      닫기
                    </Button>,
                  ]}
                  width={700}
                >
                  <Space style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => setIsAddMemberModalOpen(true)}
                    >
                      멤버 추가
                    </Button>
                  </Space>
                  <Table
                    dataSource={channelMembers}
                    rowKey="id"
                    loading={loadingMembers}
                    pagination={false}
                    size="small"
                  >
                    <Table.Column
                      title="이름"
                      dataIndex={["expand", "discord_user_id", "name"]}
                      width={120}
                      render={(name, record: any) => name || record.expand?.discord_user_id?.username || "-"}
                    />
                    <Table.Column
                      title="디스코드 ID"
                      dataIndex={["expand", "discord_user_id", "username"]}
                      width={150}
                    />
                    <Table.Column
                      title="이메일"
                      dataIndex={["expand", "discord_user_id", "email"]}
                      width={180}
                      render={(email) => email || "-"}
                    />
                    <Table.Column
                      title="역할"
                      dataIndex="role"
                      width={100}
                      render={(role) => (
                        <Tag color="blue">{role || "member"}</Tag>
                      )}
                    />
                    <Table.Column
                      title="작업"
                      width={80}
                      render={(_, memberRecord: any) => (
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveMember(memberRecord)}
                        >
                          제거
                        </Button>
                      )}
                    />
                  </Table>
                  {channelMembers.length === 0 && !loadingMembers && (
                    <div style={{ textAlign: "center", padding: 20, color: "#888" }}>
                      채널에 멤버가 없습니다.
                    </div>
                  )}
                </Modal>

                {/* 멤버 추가 Modal */}
                <Modal
                  title={`${selectedChannel?.name || "채널"}에 멤버 추가`}
                  open={isAddMemberModalOpen}
                  onOk={handleAddMember}
                  onCancel={() => {
                    setIsAddMemberModalOpen(false);
                    addMemberForm.resetFields();
                  }}
                  okText="추가"
                  cancelText="취소"
                >
                  <Form form={addMemberForm} layout="vertical">
                    <Form.Item
                      name="user_record_id"
                      label="유저 선택"
                      rules={[{ required: true, message: "유저를 선택하세요" }]}
                    >
                      <Select
                        showSearch
                        placeholder="유저를 선택하세요"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={discordUsers.map((user: any) => ({
                          label: `${user.name || "이름없음"} (${user.username || "ID없음"})`,
                          value: user.id,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name="role"
                      label="역할"
                      initialValue="member"
                    >
                      <Select
                        options={[
                          { label: "멤버", value: "member" },
                          { label: "관리자", value: "admin" },
                          { label: "모더레이터", value: "moderator" },
                        ]}
                      />
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
                {/* 팀 필터 */}
                <Space>
                  <Select
                    placeholder="팀 선택"
                    style={{ width: 200 }}
                    value={selectedTeam}
                    onChange={setSelectedTeam}
                  >
                    <Select.Option value="all">전체</Select.Option>
                    <Select.Option value="1기 A팀">1기 A팀</Select.Option>
                    <Select.Option value="1기 B팀">1기 B팀</Select.Option>
                  </Select>
                </Space>

                {/* 인증 현황 테이블 */}
                <Card title="📊 주간 인증 현황">
                  <Table
                    dataSource={getTableData()}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: 1000 }}
                    loading={isVerificationsLoading || isUsersLoading}
                  >
                    <Table.Column
                      dataIndex="name"
                      title="이름"
                      width={100}
                      fixed="left"
                      onCell={(record: any) => {
                        if (record.type === "morning") {
                          return { rowSpan: 2 };
                        }
                        return { rowSpan: 0 };
                      }}
                    />
                    <Table.Column
                      dataIndex="type"
                      title=""
                      width={60}
                      align="center"
                      render={(type: string) => (
                        <span style={{ fontSize: 12, color: "#888" }}>
                          {type === "morning" ? "아침" : "저녁"}
                        </span>
                      )}
                    />
                    <Table.Column
                      dataIndex="sunday"
                      title="일"
                      width={60}
                      align="center"
                      render={(value: boolean) => (
                        <span style={{ fontSize: 18 }}>{value ? "✅" : "❌"}</span>
                      )}
                    />
                    <Table.Column
                      dataIndex="monday"
                      title="월"
                      width={60}
                      align="center"
                      render={(value: boolean) => (
                        <span style={{ fontSize: 18 }}>{value ? "✅" : "❌"}</span>
                      )}
                    />
                    <Table.Column
                      dataIndex="tuesday"
                      title="화"
                      width={60}
                      align="center"
                      render={(value: boolean) => (
                        <span style={{ fontSize: 18 }}>{value ? "✅" : "❌"}</span>
                      )}
                    />
                    <Table.Column
                      dataIndex="wednesday"
                      title="수"
                      width={60}
                      align="center"
                      render={(value: boolean) => (
                        <span style={{ fontSize: 18 }}>{value ? "✅" : "❌"}</span>
                      )}
                    />
                    <Table.Column
                      dataIndex="thursday"
                      title="목"
                      width={60}
                      align="center"
                      render={(value: boolean) => (
                        <span style={{ fontSize: 18 }}>{value ? "✅" : "❌"}</span>
                      )}
                    />
                    <Table.Column
                      dataIndex="friday"
                      title="금"
                      width={60}
                      align="center"
                      render={(value: boolean) => (
                        <span style={{ fontSize: 18 }}>{value ? "✅" : "❌"}</span>
                      )}
                    />
                    <Table.Column
                      dataIndex="saturday"
                      title="토"
                      width={60}
                      align="center"
                      render={(value: boolean) => (
                        <span style={{ fontSize: 18 }}>{value ? "✅" : "❌"}</span>
                      )}
                    />
                    <Table.Column
                      dataIndex="streak"
                      title="연속 인증"
                      width={100}
                      align="center"
                      onCell={(record: any) => {
                        if (record.type === "morning") {
                          return { rowSpan: 2 };
                        }
                        return { rowSpan: 0 };
                      }}
                      render={(days: number) => (
                        <Badge count={days} showZero color="blue" />
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

        ]}
      />
    </Show>
  );
};
