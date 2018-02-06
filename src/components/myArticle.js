import React, { Component } from 'react';
import {Form,Input,Checkbox,Button,Tabs,Table,Icon,message,Divider,Switch,Badge,Tag} from 'antd';
const TabPane = Tabs.TabPane;
const Search = Input.Search;

class MyArticle extends Component { 
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
            var urlKey=newsids[2].split('=')[1];
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
            dataSource:[],
            allData:[],
            tags:[],
            count:[],
            username:username,
            key:urlKey,
            likes:0,
            numMark:0,
            numComment:0
        };
        this.callback=this.callback.bind(this);
        this.delete=this.delete.bind(this);
        this.search=this.search.bind(this);
        this.searchBookName=this.searchBookName.bind(this);
        this.byTag=this.byTag.bind(this);
        this.clickInFor=this.clickInFor.bind(this);
        this.callback();
    }

      
    delete(record){
        fetch('/deleteMark',{
            method:'POST' ,
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "id="+record.id+"&bookname="+record.bookname
        }).then(function (data) { 
                message.success(`删除成功!`);
                setTimeout("window.location.reload();",200);
        }).catch(function (error) { 
              message.error(`网络错误!`);
        })
          
    }
    
    byTag(tagName,tagColor){
        let data=[];
        let numMark=0;
        let likes=0;
        let numComment=0;
        for(var i=0;i<this.state.allData.length;i++)
        {
            
            if(this.state.allData[i].tag==tagName && this.state.allData[i].color==tagColor)
            {
                likes = likes + this.state.allData[i].likes;
                numMark = numMark + this.state.allData[i].mark.length;
                numComment = numComment + this.state.allData[i].comment.length;
                data.push(this.state.allData[i]);
            }
        }
        this.setState({
            dataSource:data,
            numMark:numMark,
            likes:likes,
            numComment:numComment
        })
    }

    clickInFor(tags,tagName,tagColor,count){
        this.setState({
        })
        tags.push(
            <span>
                <span className='bsTags' onClick={()=>{this.byTag(tagName,tagColor)}} style={{backgroundColor:tagColor,margin:'0.2em 0.2em 0.2em'}}>
                    {tagName}
                    <Badge count={count} style={{position:'absolute',top:'-30px',right:'-30px'}}>
                        <a href="#" className="head-example" />
                    </Badge>
                </span>
                <Divider type="vertical" />
            </span>
        );        
    }

    callback() {
        fetch('/getMarks',{
            method:'POST',
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
              }, 
            body: "username="+this.state.username
        }).then((response) =>{
            response.json()
            .then((data)=>{
                let likes=0;
                let numMark=0;
                let numComment=0;
                for(let i=0;i<data.length;i++)
                {
                    likes = likes + data[i].likes;
                    numMark = numMark + data[i].mark.length;
                    numComment = numComment + data[i].comment.length;
                }
                this.setState({
                    dataSource:data,
                    allData:data,
                    likes:likes,
                    numMark:numMark,
                    numComment:numComment
                },()=>{
                    fetch('/getUserTags',{
                        method:'POST',
                        headers: { 
                            "Content-type": "application/x-www-form-urlencoded" 
                          }, 
                        body: "username="+this.state.username
                    }).then((response) =>{
                        response.json()
                        .then((user)=>{
                            var tag = user[0].tags.split(',');
                            var tags = [];
                            var count = [];
                            for(var i=0;i<tag.length-1;i++)
                            {
                                var tagName = tag[i].split('#')[0];
                                var tagColor = '#'+tag[i].split('#')[1];
                                count[i]=0;
                                for(var j=0;j<this.state.allData.length;j++)
                                {
                                    if(this.state.allData[j].tag==tagName && this.state.allData[j].color==tagColor)
                                        count[i]=count[i] +1;
                                }
                                this.clickInFor(tags,tagName,tagColor,count[i]);
                                this.setState({
                                })
                            }
                            this.setState({
                                tags:tags,
                                count:count
                            })
                        });
                    }).catch(function(e) {
                        console.log("getUserTags error");
                    });
                })
            });
        }).catch(function(e) {
            console.log("getMarks error");
        });
    }

    search(value){
        var otherDataSource = [];
        let numMark=0;
        let numComment=0;
        let likes=0;
        for(var i=0;i<this.state.allData.length;i++)
        {
            if(this.state.allData[i].mark.indexOf(value)>=0 || this.state.allData[i].comment.indexOf(value)>=0)
            {
                likes = likes + this.state.allData[i].likes;
                numMark = numMark + this.state.allData[i].mark.length;
                numComment = numComment + this.state.allData[i].comment.length;
                otherDataSource.push(this.state.allData[i]);
            }
        }
        this.setState({
            dataSource:otherDataSource,
            likes:likes,
            numMark:numMark,
            numComment:numComment
        })
    }

    searchBookName(value){
        var otherDataSource = [];
        let numMark=0;
        let numComment=0;
        let likes=0;
        for(var i=0;i<this.state.allData.length;i++)
        {
            if(this.state.allData[i].bookname.indexOf(value)>=0)
            {
                likes = likes + this.state.allData[i].likes;
                numMark = numMark + this.state.allData[i].mark.length;
                numComment = numComment + this.state.allData[i].comment.length;
                otherDataSource.push(this.state.allData[i]);
            }
        }
        this.setState({
            dataSource:otherDataSource,
            numMark:numMark,
            likes:likes,
            numComment:numComment
        })
    }

    render() {
        const columns = [
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: '150px',
            sorter(a, b) {
                return a.time - b.time;
            },
            render: (text, record) => {
                let d = new Date();
                d.setTime(record.time);
                return (
                    <div>
                        <span>{d.toLocaleString()}</span>
                    </div>                 
                ) 
            }
        },{
            title: '标记(累计'+this.state.numMark+'字)',
            dataIndex: 'mark',
            key: 'mark',
            width: '300px',
            sorter(a, b) {
                return a.mark.length - b.mark.length;
            },
            render: (text, record) => {
                return (
                    <p>
                        <span style={{fontSize:'1.6em',color:record.color}}>
                            “
                        </span>
                        {text}
                        <span style={{fontSize:'1.6em',color:record.color}}>
                            ”
                        </span>
                        <br/>
                        <span style={{position:'absolute',right:'0px',fontSize:'0.9em',fontWeight:'bold'}}>——《{record.bookname.substr(0,record.bookname.indexOf('.epub'))}》</span>
                    </p>
                ) 
            }
        },{
            title: '批注(累计'+this.state.numComment+'字)',
            dataIndex: 'comment',
            key: 'comment',
            width: '250px',
            sorter(a, b) {
                return a.comment.length - b.comment.length;
            },
            render: (text, record) => {
                return (<p style={{fontWeight:'300',fontSize:'1.2em'}}>{text}</p>) 
            }
        },{
            title: '标签(共获得'+this.state.likes+'个赞)',
            dataIndex: 'tag',
            key: 'tag',
            width: '100px',
            sorter(a, b) {
                return a.likes - b.likes;
            },
            render: (text, record) => {
                if(record.tag=='分享')
                {
                    return (<div><Tag color={record.color}>{text}</Tag><br/><br/><Icon type="like" style={{color:'#5bc0de',fontSize:'1.2em'}}/><span style={{color:'#5bc0de',fontSize:'1.2em'}}> {record.likes}</span></div>)
                }
                else
                {
                    return (<Tag color={record.color}>{text}</Tag>)
                }
            }
        },{
            title: '操作',
            key: 'action',
            width: '250px',
            render: (text, record) => (
              <span>
                <a href="javascript:;" onClick={()=>this.delete(record)} style={{fontSize:'1.4em'}}><Icon type="delete" /></a>
                <Divider type="vertical" />
                <a href={'./reader/index2.html?bookname='+encodeURIComponent(record.bookname)+'&username='+this.state.username+'&cfi='+record.cfi+'&key='+this.state.key} style={{fontSize:'1.4em'}} target="_blank"><Icon type="play-circle-o" /></a>
              </span>
            )
        }];
        return (
            <div className='Card' style={{ background: '#fff', padding: 24, minHeight: 280 }}> 
                <div>
                    <Button onClick={this.callback}>显示全部</Button>
                    <Divider type="vertical" />
                    <Search
                        placeholder="在正文或批注中搜索..."
                        onSearch={this.search}
                        enterButton='搜索'
                        style={{display:'inline-block',width:'30%'}}
                    />
                    <Divider type="vertical" />
                    <Search
                        placeholder="在书名中搜索..."
                        onSearch={this.searchBookName}
                        enterButton='搜索'
                        style={{display:'inline-block',width:'30%'}}
                    />
                </div>
                <br/>
                <div>
                    {this.state.tags}
                </div>
                <br/>
                <Table columns={columns} dataSource={this.state.dataSource} />
            </div>                    
        );
    }
}
export default MyArticle;