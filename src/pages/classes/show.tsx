import { Show, useTable } from "@refinedev/antd";
import { useShow, useCreate, useDelete, useUpdate, useList } from "@refinedev/core";
import { Tabs, Descriptions, Table, Button, Input, Space, Checkbox, Modal, Form, message } from "antd";
import { DownloadOutlined, PlusOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export const ClassShow = () => {
  const { queryResult } = useShow();
  const classData = queryResult?.data?.data;

  const [isVODModalOpen, setIsVODModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [vodForm] = Form.useForm();
  const [assignmentForm] = Form.useForm();

  const { mutate: createVOD } = useCreate();
  const { mutate: deleteVOD } = useDelete();
  const { mutate: createAssignment } = useCreate();
  const { mutate: deleteAssignment } = useDelete();
  const { mutate: updateSubmission } = useUpdate();
  const { mutate: createSubmission } = useCreate();

  // 수강생 데이터 가져오기
  const { tableProps: studentsTableProps } = useTable({
    resource: "classStudents",
    filters: {
      permanent: [
        {
          field: "classId",
          operator: "eq",
          value: classData?.id,
        },
      ],
    },
    syncWithLocation: false,
  });

  // 출석 데이터 가져오기
  const { tableProps: attendanceTableProps } = useTable({
    resource: "classAttendances",
    filters: {
      permanent: [
        {
          field: "classId",
          operator: "eq",
          value: classData?.id,
        },
      ],
    },
    syncWithLocation: false,
  });

  // VOD 데이터 가져오기
  const { tableProps: vodTableProps, tableQueryResult } = useTable({
    resource: "classVODs",
    filters: {
      permanent: [
        {
          field: "classId",
          operator: "eq",
          value: classData?.id,
        },
      ],
    },
    syncWithLocation: false,
  });

  // 과제 데이터 가져오기
  const { data: assignmentsData, refetch: refetchAssignments } = useList({
    resource: "classAssignments",
    filters: [
      {
        field: "classId",
        operator: "eq",
        value: classData?.id,
      },
    ],
  });

  // 과제 제출 데이터 가져오기
  const { data: submissionsData, refetch: refetchSubmissions } = useList({
    resource: "classAssignmentSubmissions",
    filters: [
      {
        field: "classId",
        operator: "eq",
        value: classData?.id,
      },
    ],
  });

  const assignments = assignmentsData?.data || [];
  const submissions = submissionsData?.data || [];
  const students = studentsTableProps.dataSource || [];

  // 엑셀 다운로드
  const handleExcelDownload = () => {
    const dataSource = studentsTableProps.dataSource || [];

    const excelData = dataSource.map((student: any) => ({
      "이름": student.name,
      "이메일": student.email,
      "연락처": student.phone,
      "구매일": student.purchaseDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "수강생 목록");

    const fileName = `${classData?.name || '클래스'}_수강생_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 출석 체크 렌더링
  const renderAttendance = (attendance: boolean[], record: any, index: number) => {
    return (
      <Space>
        {attendance.map((checked, idx) => (
          <div
            key={idx}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              backgroundColor: checked ? "#52c41a" : "#ff4d4f",
              color: "white",
            }}
          >
            {checked ? <CheckOutlined /> : <CloseOutlined />}
          </div>
        ))}
      </Space>
    );
  };

  // VOD 추가
  const handleAddVOD = () => {
    vodForm.validateFields().then((values) => {
      const vods = vodTableProps.dataSource || [];
      const maxIndex = vods.length > 0 ? Math.max(...vods.map((v: any) => v.index)) : 0;

      createVOD(
        {
          resource: "classVODs",
          values: {
            classId: classData?.id,
            index: maxIndex + 1,
            title: values.title,
            url: values.url,
          },
        },
        {
          onSuccess: () => {
            message.success("VOD가 추가되었습니다.");
            setIsVODModalOpen(false);
            vodForm.resetFields();
            tableQueryResult.refetch();
          },
        }
      );
    });
  };

  // VOD 삭제
  const handleDeleteVOD = (id: number) => {
    Modal.confirm({
      title: "VOD를 삭제하시겠습니까?",
      onOk: () => {
        deleteVOD(
          {
            resource: "classVODs",
            id,
          },
          {
            onSuccess: () => {
              message.success("VOD가 삭제되었습니다.");
              tableQueryResult.refetch();
            },
          }
        );
      },
    });
  };

  // 과제 추가
  const handleAddAssignment = () => {
    assignmentForm.validateFields().then((values) => {
      const maxIndex = assignments.length > 0 ? Math.max(...assignments.map((a: any) => a.index)) : 0;

      createAssignment(
        {
          resource: "classAssignments",
          values: {
            classId: classData?.id,
            name: values.name,
            index: maxIndex + 1,
          },
        },
        {
          onSuccess: () => {
            message.success("과제가 추가되었습니다.");
            setIsAssignmentModalOpen(false);
            assignmentForm.resetFields();
            refetchAssignments();
          },
        }
      );
    });
  };

  // 과제 삭제
  const handleDeleteAssignment = (assignmentId: number) => {
    Modal.confirm({
      title: "과제를 삭제하시겠습니까?",
      content: "관련된 제출 기록도 함께 삭제됩니다.",
      onOk: () => {
        deleteAssignment(
          {
            resource: "classAssignments",
            id: assignmentId,
          },
          {
            onSuccess: () => {
              message.success("과제가 삭제되었습니다.");
              refetchAssignments();
              refetchSubmissions();
            },
          }
        );
      },
    });
  };

  // 과제 제출 상태 토글
  const handleToggleSubmission = (userId: number, assignmentId: number) => {
    const submission = submissions.find(
      (s: any) => s.userId === userId && s.assignmentId === assignmentId
    );

    if (submission) {
      // 기존 제출 기록 업데이트
      updateSubmission(
        {
          resource: "classAssignmentSubmissions",
          id: submission.id,
          values: {
            submitted: !submission.submitted,
          },
        },
        {
          onSuccess: () => {
            refetchSubmissions();
          },
        }
      );
    } else {
      // 새 제출 기록 생성
      createSubmission(
        {
          resource: "classAssignmentSubmissions",
          values: {
            classId: classData?.id,
            userId,
            assignmentId,
            submitted: true,
          },
        },
        {
          onSuccess: () => {
            refetchSubmissions();
          },
        }
      );
    }
  };

  // 과제 제출 여부 확인
  const isSubmitted = (userId: number, assignmentId: number) => {
    const submission = submissions.find(
      (s: any) => s.userId === userId && s.assignmentId === assignmentId
    );
    return submission?.submitted || false;
  };

  // 과제 체크 테이블 컬럼 동적 생성
  const assignmentColumns = [
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
      fixed: "left" as const,
      width: 100,
    },
    ...assignments.map((assignment: any) => ({
      title: (
        <Space>
          <span>{assignment.name}</span>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAssignment(assignment.id)}
          />
        </Space>
      ),
      key: `assignment-${assignment.id}`,
      width: 150,
      align: "center" as const,
      render: (_: any, record: any) => {
        const submitted = isSubmitted(record.userId, assignment.id);
        return (
          <div
            onClick={() => handleToggleSubmission(record.userId, assignment.id)}
            style={{
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              backgroundColor: submitted ? "#52c41a" : "#ff4d4f",
              color: "white",
              cursor: "pointer",
            }}
          >
            {submitted ? <CheckOutlined /> : <CloseOutlined />}
          </div>
        );
      },
    })),
  ];

  return (
    <Show>
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: "클래스 정보",
            children: (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="클래스명">{classData?.name}</Descriptions.Item>
                <Descriptions.Item label="기간">{classData?.period}</Descriptions.Item>
                <Descriptions.Item label="가격">{classData?.price}</Descriptions.Item>
                <Descriptions.Item label="수강생 수">{classData?.studentCount}명</Descriptions.Item>
                <Descriptions.Item label="챌린지 수">{classData?.challengeCount}개</Descriptions.Item>
                <Descriptions.Item label="상태">{classData?.status}</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: "students",
            label: "수강생 관리",
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button type="primary">수강생 추가</Button>
                  <Button danger>선택 제거</Button>
                  <Button
                    type="default"
                    icon={<DownloadOutlined />}
                    onClick={handleExcelDownload}
                  >
                    엑셀 다운로드
                  </Button>
                </Space>
                <Table {...studentsTableProps} rowKey="id" rowSelection={{}}>
                  <Table.Column dataIndex="name" title="이름" width={100} />
                  <Table.Column dataIndex="email" title="이메일" width={200} />
                  <Table.Column dataIndex="phone" title="연락처" width={130} />
                  <Table.Column dataIndex="purchaseDate" title="구매일" width={120} />
                </Table>
              </>
            ),
          },
          {
            key: "attendance",
            label: "출석체크",
            children: (
              <Table {...attendanceTableProps} rowKey="id" pagination={false}>
                <Table.Column dataIndex="name" title="이름" width={100} />
                <Table.Column
                  dataIndex="attendance"
                  title="출석 (1회차 ~ 4회차)"
                  render={(attendance, record, index) => renderAttendance(attendance, record, index)}
                />
              </Table>
            ),
          },
          {
            key: "assignment",
            label: "과제 체크",
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAssignmentModalOpen(true)}
                  >
                    과제 추가
                  </Button>
                </Space>
                <Table
                  dataSource={students}
                  columns={assignmentColumns}
                  rowKey="userId"
                  pagination={false}
                  scroll={{ x: true }}
                />

                <Modal
                  title="과제 추가"
                  open={isAssignmentModalOpen}
                  onOk={handleAddAssignment}
                  onCancel={() => {
                    setIsAssignmentModalOpen(false);
                    assignmentForm.resetFields();
                  }}
                  okText="추가"
                  cancelText="취소"
                >
                  <Form form={assignmentForm} layout="vertical">
                    <Form.Item
                      name="name"
                      label="과제명"
                      rules={[{ required: true, message: "과제명을 입력하세요" }]}
                    >
                      <Input placeholder="예: 1주차 과제" />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            ),
          },
          {
            key: "vod",
            label: "VOD 관리",
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsVODModalOpen(true)}
                  >
                    VOD 추가
                  </Button>
                </Space>
                <Table {...vodTableProps} rowKey="id" pagination={false}>
                  <Table.Column dataIndex="index" title="인덱스" width={80} align="center" />
                  <Table.Column dataIndex="title" title="제목" />
                  <Table.Column
                    dataIndex="url"
                    title="URL"
                    render={(url) => (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                      </a>
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
                        onClick={() => handleDeleteVOD(record.id)}
                      >
                        삭제
                      </Button>
                    )}
                  />
                </Table>

                <Modal
                  title="VOD 추가"
                  open={isVODModalOpen}
                  onOk={handleAddVOD}
                  onCancel={() => {
                    setIsVODModalOpen(false);
                    vodForm.resetFields();
                  }}
                  okText="추가"
                  cancelText="취소"
                >
                  <Form form={vodForm} layout="vertical">
                    <Form.Item
                      name="title"
                      label="제목"
                      rules={[{ required: true, message: "제목을 입력하세요" }]}
                    >
                      <Input placeholder="VOD 제목" />
                    </Form.Item>
                    <Form.Item
                      name="url"
                      label="URL"
                      rules={[
                        { required: true, message: "URL을 입력하세요" },
                        { type: "url", message: "올바른 URL을 입력하세요" },
                      ]}
                    >
                      <Input placeholder="https://example.com/vod" />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            ),
          },
          {
            key: "discord",
            label: "디스코드 채널",
            children: (
              <>
                <Descriptions bordered column={1} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="채널 ID">-</Descriptions.Item>
                  <Descriptions.Item label="채널명">-</Descriptions.Item>
                  <Descriptions.Item label="인증 완료">0명</Descriptions.Item>
                  <Descriptions.Item label="인증 미완료">0명</Descriptions.Item>
                </Descriptions>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Input.TextArea placeholder="초대 링크" rows={2} />
                  <Button type="primary">링크 저장</Button>
                </Space>
              </>
            ),
          },
          {
            key: "challenges",
            label: "연계 챌린지",
            children: (
              <Table dataSource={[]} rowKey="id">
                <Table.Column dataIndex="challengeName" title="챌린지명" />
                <Table.Column dataIndex="participants" title="참여자 수" />
                <Table.Column dataIndex="period" title="기간" />
              </Table>
            ),
          },
        ]}
      />
    </Show>
  );
};
