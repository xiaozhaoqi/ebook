import React,{Component} from 'react';
import { Form, Input, Icon, Button,message,Checkbox} from 'antd';
import { setTimeout } from 'core-js/library/web/timers';
const FormItem = Form.Item;

class RegisterForm extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            username:'',
            password:''
        };
        this.handleSubmit=this.handleSubmit.bind(this);
    }

    handleSubmit(e){
        e.preventDefault();
        const form = this.props.form;
        var input1 = document.getElementById('username').value;
        var input2 = document.getElementById('password').value;
        var chinese = /^[\u4e00-\u9fa5]+$/;
        if(form.getFieldValue('agreement')!=true)
        {
            message.info('请阅读并同意注册条款');
            return;
        }
        if(input1=='' || input2=='')
        {
            message.warn('用户名或密码不能为空');
            return;
        }
        if (!chinese.test(input1)) {
            message.warn('用户名中含有非中文字符');
            return;
        };
        if (input1.length>16) {
            message.warn('太长');
            return;
        };
        var mydate = new Date();
        fetch('/register', { 
            method: 'post', 
            headers: { 
              "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="+input1+"&password="+input2+"&registertime="+mydate.toLocaleString()
            })
            .then(
                response => response.json()
            ).then(
                function (data) { 
                    if(data.ok=='1')
                    {
                        message.success(`注册成功，请登录!`);
                        setTimeout('window.location.href="/login";',1000);
                    }
                    else
                    {
                        message.error(`这个名字已经被别人占了，换一个试试吧~`);
                    }
                    
                }) 
            .catch(function (error) { 
                console.log(error);
                message.error(`注册失败!`);
            })
        
    }
 
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 8 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 16 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
              xs: {
                span: 24,
                offset: 0,
              },
              sm: {
                span: 16,
                offset: 8,
              },
            },
          };
        return (
        <div className='Card' style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <h1 style={{textAlign:'center'}}>请注册</h1>
            <Form onSubmit={this.handleSubmit} style={{position:'relative',left:'15%',right:'35%',width:'50%'}}>
                    <FormItem
                        {...formItemLayout}
                        label="中文用户名（昵称）"
                        >
                        {getFieldDecorator('username', {
                            rules: [{
                                required: true, message: '请输入用户名！',
                                max: 16, message:'你这个名字太长了'
                            }],
                        })(
                            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="密码"
                        >
                        {getFieldDecorator('password', {
                            rules: [{
                            required: true, message: '请输入密码！',
                            }],
                        })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" />
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        {getFieldDecorator('agreement', {
                            valuePropName: 'checked',
                        })(
                            <Checkbox>我已阅读并同意 <a href="">《电子书标记分享平台注册条款》</a></Checkbox>
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button id='btnSubmit' type="primary" htmlType="submit">立即注册</Button>
                    </FormItem>
            </Form>
        </div>
        );
    }
}
const Register = Form.create()(RegisterForm);

export default Register;