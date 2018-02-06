import React, { Component } from 'react';
import {Form,Input,Checkbox,Button,Icon,message,Upload} from 'antd';
import fetchJsonp from 'fetch-jsonp';
const Dragger = Upload.Dragger;
class BookUpload extends Component { 
    constructor(props) {
        super(props);
        var urlinfo = window.location.href;
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
            message.error(`请登录！`);
            setTimeout('window.location.href="/login";',1000);
        }
        this.state = {
            username:username
        };
    }
    render() {
        const props = {
            name: '123',
            multiple: true,
            showUploadList: false,
            action: '/upload',
            onChange(info) {
                const status = info.file.status;
                const res = info.file.response;
                const progress = info.event;
                if (status == 'uploading') {
                    message.info(`正在上传 ${progress.percent.toFixed(2)}% `);
                }
                if (res.status == 'success'){
                    message.success(`上传成功!`); 
                    fetchJsonp('https://api.douban.com/v2/book/search?q='+info.file.name+'&count=1')
                    .then(function(response) {return response.json()})
                    .then(function(json) {
                        fetch('/saveDoubanInfo',{
                            method:'POST',
                            headers: { 
                                "Content-type": "application/x-www-form-urlencoded" 
                            }, 
                            body: "bookname="+info.file.name
                                +"&douban="+JSON.stringify(json.books[0])
                        })
                    }).catch(function(ex) {
                        console.log('parsing failed', ex)
                    })
                }
                if (res.status == 'error'){
                    message.success(`这本书已经有了，请到书库中查看!`);
                }
                if (res.status == 'notEpub'){
                    message.error(`上传文件不符合ePub格式规范!`);
                }
            },
          };
        return (
            <div style={{ marginTop: 16, height: 500}}>
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text" style={{fontSize:24,color:'#108ee9'}}>将ePub图书分享到图书仓库，所有读者都可以阅读并标记</p>
                </Dragger>
            </div>
        );
    }
}
export default BookUpload;