'use strict';

import React from 'react';
import ReactDom from 'react-dom';
import { Router, Route, Link,browserHistory , IndexRoute, Redirect, IndexLink} from 'react-router';

// 引入Antd的导航组件
import { Menu, Icon,message,Layout,BackTop,Affix } from 'antd';
const { Header, Content, Footer } = Layout;
import myIntroduce from './introduce.js';
import BookManager from './bookManager';
import Register from './register';
import Login from './login';
import MyArticle from './myArticle';
import '../styles/app.scss';
import { setTimeout } from 'core-js/library/web/timers';
const SubMenu = Menu.SubMenu;
// 配置导航
class Sider extends React.Component {
    constructor(props) {
        super(props);
        message.config({
            top: 200,
            duration: 1,
        });
        var urlinfo = decodeURIComponent(window.location.href);
        var len=urlinfo.length;//获取url的长度
        var offset=urlinfo.indexOf("?");//设置参数字符串开始的位置
        if(offset==-1)
            var newsidinfo=''
        else
            var newsidinfo=urlinfo.substr(offset,len)//取出参数字符串 这里会获得类似“id=1”这样的字符串
        if(newsidinfo.indexOf('&')>=0)
        {
            var newsids=newsidinfo.split("&");//对获得的参数字符串按照“=”进行分割
            var logState=newsids[0].split('=')[1];//得到参数值
            var username=newsids[1].split('=')[1];
            var keycheck=newsids[2].split('=')[1];
            if(logState==1 && 
                newsids[0].split('=')[0]=='?logState' &&
                newsids[1].split('=')[0]=='username' && 
                newsids[2].split('=')[0]=='keycheck'
                )
            {
            }
            else{
                message.error(`登录异常！即将回到主页！`);
                setTimeout('window.location.href="/";',1000);
            }
        }
        else
        {
            var username = '';
            var keycheck = -1;
            var logState = 0;
        }
        this.state = {
            username: username,
            loginstate: logState,
            keycheck: keycheck,
            urlState: newsidinfo,
            current:'1'
        };
        this.handleClick=this.handleClick.bind(this);
        this.logout=this.logout.bind(this);
        this.handleClick();
    }

    handleClick(e) {
        if(this.state.username!='')
        {
            fetch('/checkLoginState', { 
                method: 'post', 
                headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
                }, 
                body: "username="+this.state.username+"&keycheck="+this.state.keycheck
            }).then(
                response => response.json()
            ).then( (data)=> {
                if(data.ok=='0')
                {
                    message.error(`登录异常！即将回到主页！`);
                    setTimeout('window.location.href="/";',1000);
                }
                else
                {
                    if(e!=undefined)
                    {
                        this.setState({
                            current: e.key,
                        });
                    }
                }
            }) 
            .catch(function (error) { 
                console.log(error);
            })
        }
        else
        {
            if(document.cookie.indexOf('username')>-1)
            {
                let t1 = document.cookie.indexOf('username=');
                let t2 = document.cookie.indexOf(';',t1);
                let t3 = document.cookie.slice(t1+9,t2);
                let t4 = document.cookie.indexOf('password=');
                let t6 = document.cookie.slice(t4+9);
                fetch('/login', { 
                    method: 'post', 
                    headers: { 
                      "Content-type": "application/x-www-form-urlencoded" 
                    }, 
                    body: "username="+t3+"&password="+t6
                  }).then(
                    response => response.json()
                  ).then(function (data) {
                    if(data.logState=='1')
                    {
                        window.location.href='/?logState=1&username='+t3+'&keycheck='+data.keycheck;
                    }
                    else
                        message.error(`用户名或密码错误!`);
                  }) 
                  .catch(function (error) { 
                    message.error(`网络错误，登录失败!`);
                    console.log(error);
                  })
            }
        }
    }

    logout(){
        let keys = document.cookie.match(/[^ =;]+(?=\=)/g);  
        if(keys) {  
            for(let i = keys.length; i--;)  
                document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()  
        }  
        fetch('/logoutClear', { 
            method: 'post', 
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="+this.state.username
            }).then(
                response => response.json()
            ).then( (data) =>{
                if(data.keycheck==this.state.keycheck)
                {
                    message.success('已退出登录');
                    setTimeout('window.location.href="/";',1000);  
                }
                else{
                    message.success('账号异常');
                }
            }) 
            .catch(function (error) { 
                console.log(error);
            })
    }

    render() {
        var loginButton;
        var registerButton;
        var bookButton;
        var markButton;
        if(document.documentElement.clientWidth<=800)
        {
            message.info('移动设备建议横屏使用~');
        }
        if(this.state.loginstate==1)
        {
            loginButton = <SubMenu style={{fontSize:'1.1em',color:'#5bc0de',float:'right',margin:'0px 15% 0px 0px'}} title={<span><Icon type="user" style={{fontSize:'20px',color:'#5bc0de',position:'relative',top:'2px'}} />{this.state.username}</span>}>
                                <Menu.Item key="7"><Link to="/" onClick={this.logout} ><span style={{fontSize:'1.1em',color:'#5bc0de'}}>退出</span></Link></Menu.Item>
                            </SubMenu> ;
            bookButton = <Menu.Item key="2"><Link to={"/bookManager"+this.state.urlState}><span style={{fontSize:'1.1em',color:'#5bc0de'}}>图书</span></Link></Menu.Item>;
            markButton = <Menu.Item key="3"><Link to={"/myArticle"+this.state.urlState}><span style={{fontSize:'1.1em',color:'#5bc0de'}}>标记</span></Link></Menu.Item>;
            registerButton = null;
        }
        else
        {
            loginButton = <Menu.Item key="4" style={{float:'right',margin:'0px 1% 0px 0px'}}><Link to="/login"><span style={{fontSize:'1.1em',color:'#5bc0de'}}>登录</span></Link></Menu.Item>;
            registerButton = <Menu.Item key="5" style={{float:'right',margin:'0px 15% 0px 0px'}}><Link to="/register"><span style={{fontSize:'1.1em',color:'#5bc0de'}}>注册</span></Link></Menu.Item>;
            bookButton = null;
            markButton = null;
        }
            
        return (
            <div>
                <Layout className="layout">
                    <Affix>
                        <Header style={{backgroundColor:'#fff',borderRadius:'5px'}}>
                            <Menu
                                theme="light"
                                mode="horizontal"
                                style={{ lineHeight: '64px',position:'relative',padding:'0px'}}
                                onClick={this.handleClick.bind(this)}
                                selectedKeys={[this.state.current]}
                            >
                                <Link to={"/"+this.state.urlState}><img className='img' style={{float:'left',position:'relative',margin:'0px 20px 0px 14%'}} src='../logo.png'/></Link>
                                <Menu.Item key="6" className='mainItem' style={{float:'left',position:'relative',margin:'0px 20px 0px 14%'}}><Link to={"/"+this.state.urlState}><span style={{fontSize:'1.1em',color:'#5bc0de'}}>首页</span></Link></Menu.Item>
                                {bookButton}
                                {markButton}
                                {registerButton}
                                {loginButton}
                            </Menu>
                        </Header>
                    </Affix>
                    <Content style={{ padding: '2% 17%',minHeight:'1000px',backgroundColor:'#f3f3f3'}}>
                        { this.props.children }
                        <BackTop>
                            <Icon type="up-square" style={{fontSize:'30px'}} />
                        </BackTop>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        <a href='#' onClick={ ()=>{window.open('https://github.com/xiaozhaoqi')} }>开发者</a>
                    </Footer>
                </Layout>
            </div>
        )
    }
}

// 配置路由
ReactDom.render((
    <Router history={browserHistory} >
        <Route path="/" component={Sider}>
            <IndexRoute component={myIntroduce}/>
            <Route path="myArticle" component={MyArticle} />
            <Route path="bookManager" component={BookManager} />
            <Route path="register" component={Register} />
            <Route path="login" component={Login } />
        </Route>
    </Router>
), document.getElementById('app'));
