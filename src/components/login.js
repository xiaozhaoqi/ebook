import React,{Component} from 'react';
import { Form, Input, Icon, Button,message,Checkbox } from 'antd';
const FormItem = Form.Item;

class LoginForm extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            username:'',
            password:'',
            logState:'0'
        };
        this.handleSubmit=this.handleSubmit.bind(this);
    }
    handleSubmit(e){ 
        e.preventDefault();
        message.config({
            top: 200,
            duration: 1,
        });
        var chinese = /^[\u4e00-\u9fa5]+$/;
        var username = document.getElementById('userName').value;
        var password = document.getElementById('password').value;
        if(username=='' || password=='')
        {
            message.warn('用户名或密码不能为空');
            return;
        }
        if (!chinese.test(username)) {
            message.warn('用户名中含有非中文字符');
            return;
        };
        fetch('/login', { 
            method: 'post', 
            headers: { 
              "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="+username+"&password="+password
          }).then(
            response => response.json()
          ).then(function (data) {
            if(data.logState=='1')
            {
                let d = new Date();
                d.setTime(d.getTime()+(30*24*60*60*1000));
                let expires = "expires="+d.toGMTString();
                document.cookie=`username=${username};${expires}; path=/`;
                document.cookie=`password=${password};${expires}; path=/`;
                window.location.href='/?logState=1&username='+username+'&keycheck='+data.keycheck;
            }
            else
                message.error(`用户名或密码错误!`);
          }) 
          .catch(function (error) { 
            message.error(`网络错误，登录失败!`);
            console.log(error);
          })
    }
 
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
        <div className='Card' style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <h1 style={{textAlign:'center'}}>请登录</h1>
            <Form className="login-form" style={{position:'relative',left:'25%',right:'25%',width:'50%'}} onSubmit={this.handleSubmit}>
                    <FormItem>
                        {getFieldDecorator('userName', {
                            rules: [{ required: true, message: '请输入用户名！' }],
                        })(
                            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="中文用户名（昵称）" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '请输入密码！' }],
                        })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
                        )}
                    </FormItem>
                    <FormItem>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            登录
                        </Button>
                        <a href="./register" style={{position:'relative',float:'right'}}>去注册</a>
                    </FormItem>
            </Form>
        </div>
        );
    }
}
const Login = Form.create()(LoginForm);
export default Login;