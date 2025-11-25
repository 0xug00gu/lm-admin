import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, InputNumber, Checkbox, Radio, Card, Divider, Alert, Switch } from "antd";
import { useState } from "react";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const ChallengeEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const [challengeType, setChallengeType] = useState<string>(
    queryResult?.data?.data?.type || "lifemastery"
  );

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        {/* 챌린지 타입 선택 */}
        <Card title="챌린지 타입" style={{ marginBottom: 24 }}>
          <Form.Item
            name="type"
            rules={[{ required: true, message: "챌린지 타입을 선택해주세요" }]}
          >
            <Radio.Group
              onChange={(e) => setChallengeType(e.target.value)}
            >
              <Radio.Button value="lifemastery" style={{ marginRight: 16 }}>
                🏆 라이프마스터리
              </Radio.Button>
              <Radio.Button value="lifemastery-club" style={{ marginRight: 16 }}>
                🎯 라이프마스터리 클럽
              </Radio.Button>
              <Radio.Button value="meditation" style={{ marginRight: 16 }}>
                🧘 명상 바디더블링
              </Radio.Button>
              <Radio.Button value="weekly-planning">
                📅 위클리 플래닝
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {challengeType === "lifemastery" && (
            <Alert
              message="라이프마스터리 챌린지"
              description="아침/데일리 인증을 통해 루틴을 만드는 챌린지입니다. #인증 태그로 인증합니다."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          {challengeType === "lifemastery-club" && (
            <Alert
              message="라이프마스터리 클럽"
              description="라이프마스터리 클럽 전용 챌린지입니다. 기수별로 관리되며, 팀 단위로 운영됩니다."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          {challengeType === "meditation" && (
            <Alert
              message="명상 바디더블링 챌린지"
              description="#시작으로 명상을 시작하고, #종료로 명상을 종료하는 간단한 인증 방식입니다."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          {challengeType === "weekly-planning" && (
            <Alert
              message="위클리 플래닝 챌린지"
              description="매주 주간 계획을 선언하는 챌린지입니다. 기상시간, 취침시간, 핵심미션, 이번주 다짐, 월간 프로젝트를 포함합니다."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
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

          {(challengeType === "lifemastery" || challengeType === "lifemastery-club") && (
            <Form.Item
              label="기수"
              name="generation"
              rules={[{ required: true, message: "기수를 입력해주세요" }]}
            >
              <InputNumber
                placeholder="기수를 입력하세요"
                min={1}
                style={{ width: 200 }}
                addonAfter="기"
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                예: 1기, 2기, 3기...
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="기간"
            name="period"
            rules={[{ required: true, message: "기간을 선택해주세요" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="가격"
            name="price"
            rules={[{ required: true, message: "가격을 입력해주세요" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="가격을 입력하세요"
              min={0}
              formatter={(value) => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item label="설명" name="description">
            <TextArea rows={4} placeholder="챌린지 설명을 입력하세요" />
          </Form.Item>
        </Card>

        {/* 라이프마스터리 전용 설정 */}
        {(challengeType === "lifemastery" || challengeType === "lifemastery-club") && (
          <Card title={challengeType === "lifemastery-club" ? "🎯 라이프마스터리 클럽 설정" : "🏆 라이프마스터리 설정"} style={{ marginBottom: 24 }}>
            <Form.Item label="인증 규칙 활성화" name="authRuleEnabled" valuePropName="checked">
              <Switch defaultChecked />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                인증 규칙을 비활성화하면 출석 체크만 진행되며 리셋방 이동 등의 규칙이 적용되지 않습니다
              </div>
            </Form.Item>

            <Divider />

            <Form.Item label="인증 요일 설정" name="weekdays">
              <Checkbox.Group>
                <Checkbox value="mon">월</Checkbox>
                <Checkbox value="tue">화</Checkbox>
                <Checkbox value="wed">수</Checkbox>
                <Checkbox value="thu">목</Checkbox>
                <Checkbox value="fri">금</Checkbox>
                <Checkbox value="sat">토</Checkbox>
                <Checkbox value="sun">일</Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <Divider />

            <Form.Item label="주간 최소 인증 횟수" name="minWeeklyCount">
              <InputNumber
                min={0}
                max={7}
                addonAfter="회"
                style={{ width: 200 }}
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                주간 최소 인증 횟수 미만시 리셋방으로 이동합니다
              </div>
            </Form.Item>

            <Form.Item label="부활 최소 인증 횟수" name="revivalMinCount">
              <InputNumber
                min={0}
                max={7}
                addonAfter="회"
                style={{ width: 200 }}
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                부활대기방에서 이 횟수 이상 인증시 원래 팀으로 복귀합니다
              </div>
            </Form.Item>

            <Form.Item label="휴식방 강등 기간" name="restPeriod">
              <InputNumber
                min={1}
                max={4}
                addonAfter="주"
                style={{ width: 200 }}
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                부활대기방에서 이 기간 이내 미복귀시 휴식방으로 이동합니다
              </div>
            </Form.Item>
          </Card>
        )}

        {/* 명상 바디더블링 전용 설정 */}
        {challengeType === "meditation" && (
          <Card title="🧘 명상 바디더블링 설정" style={{ marginBottom: 24 }}>
            <Alert
              message="인증 방법"
              description={
                <div>
                  <p>• <strong>#시작</strong>: 명상을 시작할 때 입력합니다</p>
                  <p>• <strong>#종료</strong>: 명상을 종료할 때 입력합니다</p>
                  <p style={{ marginBottom: 0 }}>• 시작과 종료 사이의 시간이 자동으로 기록됩니다</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Divider>명상 기본 설정</Divider>

            <Form.Item label="일일 목표 명상 시간 (분)" name="dailyGoalMinutes">
              <InputNumber
                min={0}
                addonAfter="분"
                style={{ width: 200 }}
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                하루 목표 명상 시간을 설정합니다
              </div>
            </Form.Item>

            <Form.Item label="최소 명상 시간 (분)" name="minMeditationMinutes">
              <InputNumber
                min={1}
                addonAfter="분"
                style={{ width: 200 }}
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                이 시간 이상 명상해야 인증으로 인정됩니다
              </div>
            </Form.Item>

            <Divider>메시지 템플릿</Divider>

            <Form.Item label="#시작 메시지" name="startMessage">
              <TextArea
                rows={3}
                placeholder="#시작 입력 시 전송될 메시지를 입력하세요"
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                사용자가 #시작을 입력했을 때 자동으로 전송되는 메시지
              </div>
            </Form.Item>

            <Form.Item label="#종료 메시지" name="endMessage">
              <TextArea
                rows={3}
                placeholder="#종료 입력 시 전송될 메시지를 입력하세요"
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                사용자가 #종료를 입력했을 때 자동으로 전송되는 메시지
              </div>
            </Form.Item>

            <Alert
              message="명상 시간대 관리는 하단의 '명상 시간대 관리' 탭에서 할 수 있습니다."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        )}

        {/* 위클리 플래닝 전용 설정 */}
        {challengeType === "weekly-planning" && (
          <Card title="📅 위클리 플래닝 설정" style={{ marginBottom: 24 }}>
            <Alert
              message="선언 양식"
              description={
                <div>
                  <p>• <strong>기상시간</strong>: 매일 목표 기상시간</p>
                  <p>• <strong>취침시간</strong>: 매일 목표 취침시간</p>
                  <p>• <strong>핵심미션</strong>: 이번 주 핵심 미션</p>
                  <p>• <strong>이번주 다짐</strong>: 주간 다짐 한마디</p>
                  <p style={{ marginBottom: 0 }}>• <strong>N월 프로젝트</strong>: 월간 프로젝트 목표</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item label="선언 마감 요일" name="declarationDeadline">
              <Radio.Group>
                <Radio value="sun">일요일</Radio>
                <Radio value="mon">월요일</Radio>
              </Radio.Group>
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                매주 이 요일까지 선언을 완료해야 합니다
              </div>
            </Form.Item>

            <Form.Item label="선언 마감 시간" name="declarationDeadlineTime">
              <InputNumber
                min={0}
                max={23}
                addonAfter="시"
                style={{ width: 200 }}
              />
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                마감 요일의 몇 시까지 선언해야 하는지 설정합니다
              </div>
            </Form.Item>

            <Form.Item label="선언 필수 여부" name="declarationRequired">
              <Radio.Group>
                <Radio value={true}>필수</Radio>
                <Radio value={false}>선택</Radio>
              </Radio.Group>
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                필수 선택시 미선언자는 별도 알림을 받습니다
              </div>
            </Form.Item>
          </Card>
        )}

        {/* 디스코드 설정 */}
        <Card title="디스코드 설정" style={{ marginBottom: 24 }}>
          <Form.Item label="디스코드 카테고리 ID" name="discordCategoryId">
            <Input placeholder="디스코드 카테고리 ID를 입력하세요" />
          </Form.Item>

          <Form.Item label="디스코드 채널 ID" name="discordChannelId">
            <Input placeholder="디스코드 채널 ID를 입력하세요" />
          </Form.Item>
        </Card>
      </Form>
    </Edit>
  );
};
