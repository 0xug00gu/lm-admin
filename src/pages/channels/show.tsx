import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions, Tag } from "antd";

export const ChannelShow = () => {
  const { queryResult } = useShow({
    resource: "channels",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
        <Descriptions.Item label="채널 ID">{record?.channel_id || "-"}</Descriptions.Item>
        <Descriptions.Item label="채널명">{record?.name || "-"}</Descriptions.Item>
        <Descriptions.Item label="길드 ID">{record?.guild_id || "-"}</Descriptions.Item>
        <Descriptions.Item label="타입">{record?.type || "-"}</Descriptions.Item>
        <Descriptions.Item label="부모 ID">{record?.parent_id || "-"}</Descriptions.Item>
        <Descriptions.Item label="소유자 ID">{record?.owner_id || "-"}</Descriptions.Item>
        <Descriptions.Item label="주제">{record?.topic || "-"}</Descriptions.Item>
        <Descriptions.Item label="비공개 여부">
          <Tag color={record?.is_private ? "red" : "green"}>
            {record?.is_private ? "비공개" : "공개"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="활성 상태">
          <Tag color={record?.is_active ? "green" : "red"}>
            {record?.is_active ? "활성" : "비활성"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="생성일">
          {record?.created ? new Date(record.created).toLocaleString() : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="수정일">
          {record?.updated ? new Date(record.updated).toLocaleString() : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
