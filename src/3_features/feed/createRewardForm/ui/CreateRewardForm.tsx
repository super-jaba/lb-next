'use client'

import { userApi } from '@/4_entities/user'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Col, Flex, Form, Input, notification, Row, Spin, Tour, TourProps, Typography } from 'antd'
import { FC, useRef, useState } from 'react'
import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { feedApi } from '@/4_entities/feed'
import { profileApi } from '@/4_entities/me'
import { useRouter } from 'next/navigation'
import s from './CreateRewardForm.module.css'
import { hintsConfig } from '@/5_shared/config/hints.config'


const CreateRewardForm: FC = () => {

    const queryClient = useQueryClient();

    const { error, isLoading } = useQuery({
        queryKey: userApi.qkGetUserData(),
        queryFn: () => userApi.getUserData(),
        networkMode: 'offlineFirst',
        retry: false
    })

    const { mutateAsync: createRewardMutation, isPending } = useMutation({
        mutationFn: feedApi.createReward
    })
    const [api, contextHolder] = notification.useNotification()
    const router = useRouter()

    const ref1 = useRef<any>(null)
    const [open, setOpen] = useState<boolean>(false);

    const steps: TourProps['steps'] = [
        {
            title: hintsConfig['rewardForm'].title,
            description: hintsConfig['rewardForm'].body,
            target: () => ref1.current,
            nextButtonProps: {
                children: hintsConfig['rewardForm'].buttonText
            }
        }
    ]

    return (
        <Card
            className={s.box}
        >
            <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
            <QuestionCircleOutlined
                ref={ref1}
                onClick={() => { setOpen(true) }}
                className={`opacity50 ${s.question}`}
            />
            {contextHolder}
            {
                isLoading
                    ? <Flex justify="center"><Spin /></Flex>
                    : error
                        ? <Flex
                            vertical
                            gap="small"
                            align="center">
                            <Typography>To post rewards,</Typography>
                            <Button
                                onClick={() => {
                                    const location = window.location.href
                                    userApi.loginWithGitHub(location)
                                }}
                                icon={<GithubOutlined />}
                                type="primary"
                                style={{ width: '100%' }}
                            >
                                Login with GitHub
                            </Button>
                        </Flex>
                        : <Form
                            onFinish={async (vals: { issueUrl: string, rewardAmount: number }) => {
                                try {
                                    await createRewardMutation({
                                        issueUrl: vals.issueUrl,
                                        rewardAmount: vals.rewardAmount
                                    })
                                    queryClient.invalidateQueries({queryKey: profileApi.qkGetUserWallet()})
                                    router.refresh()
                                    api.success({
                                        message: 'Success'
                                    })
                                }
                                catch (e) {
                                    api.error({
                                        message: 'Error'
                                    })
                                }
                            }}
                        >
                            <Row gutter={[8, 8]}>
                                <Col span={18} md={18} xs={16}>
                                    <Form.Item
                                        name="issueUrl"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Required field'
                                            }
                                        ]}
                                    >
                                        <Input placeholder="Issue URL e.g. https://github.com/microsoft/vscode/issues/90" />
                                    </Form.Item>
                                </Col>
                                <Col span={6} md={6} xs={8}>
                                    <Form.Item
                                        name="rewardAmount"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Required field'
                                            }
                                        ]}
                                    >
                                        <Input placeholder="Amount in sats" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Button
                                        loading={isPending}
                                        htmlType="submit"
                                        type="primary"
                                        style={{ width: '100%' }}
                                    >
                                        Submit new reward
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
            }
        </Card>
    )
}
export { CreateRewardForm }