import React, { Component } from 'react';
import {Form,Input,Checkbox,Button,Tabs,Table,Icon,message,Card,Badge, Avatar,List,Tag,Popover,Carousel,Tooltip} from 'antd';
const TabPane = Tabs.TabPane;
const { Meta } = Card;

class myIntroduce extends Component { 
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
            var username = '';
            var urlKey = -1;
        }
        this.state = {
            dataSource:[],
            dataBook:[],
            username:username,
            keycheck:urlKey,
            content:{},
            listData:[],
            tagsData:[],
            commentWord:0,
            markWord:0
        };
        this.callbook=this.callbook.bind(this);
        this.readerBook=this.readerBook.bind(this);
        this.userCard=this.userCard.bind(this);
        this.likes=this.likes.bind(this);
        this.markFresh=this.markFresh.bind(this);
        this.callbook();
        this.userCard();
        this.markFresh();
        setInterval(this.markFresh,60000);
    }
    markFresh(){
        fetch('/getActive',{
            method:'POST',
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
              }, 
            body: "username=null"
        }).then((response) =>{
            response.json()
            .then((data)=>{
                this.setState({
                    dataSource:data
                },()=>{
                    let allListData = [];
                    let d = new Date();
                    for(let i=0;i<this.state.dataSource.length;i++){
                        if(this.state.dataSource[i].comment!='' && this.state.dataSource[i].comment!='快速标记')
                        {
                            let timeBefore = d.getTime()-this.state.dataSource[i].time;
                            let sec = parseInt(timeBefore/1000);
                            let min = parseInt(sec/60);
                            let hour = parseInt(min/60);
                            let day = parseInt(hour/24);
                            let month = parseInt(day/30);
                            let str = `发表于${month>1?month+'个月前':day>1?day+'天前':hour>1?hour+'小时前':min>1?min+'分钟前':sec+'秒前'}`;
                            allListData.push({
                                time: str,
                                id: this.state.dataSource[i].id,
                                likes: this.state.dataSource[i].likes,
                                bookname: this.state.dataSource[i].bookname,
                                href: './reader/index2.html?bookname='+encodeURIComponent(this.state.dataSource[i].bookname)+'&username='+this.state.username+'&cfi='+this.state.dataSource[i].cfi+'&key='+this.state.keycheck, 
                                title: <Popover 
                                            placement="rightTop" 
                                            title={this.state.dataSource[i].username} 
                                            content={this.state.content[this.state.dataSource[i].username]}
                                        >
                                            <span 
                                                style={{fontWeight:'bold',color:'#259',fontSize:'1.1em',cursor:'pointer'}}
                                            >
                                                {this.state.dataSource[i].username}
                                            </span>
                                        </Popover>,
                                description: <span><Tag color="#18c9aa">分享</Tag><span style={{fontWeight:'500',fontFamily:'Microsoft Yahei'}}>“ {this.state.dataSource[i].comment.length>128?this.state.dataSource[i].comment.slice(0,127)+'...':this.state.dataSource[i].comment} ”</span></span>,
                                content:  <span style={{fontSize:'0.9em'}}><Tag color="#18c9aa">标记</Tag> {this.state.dataSource[i].mark.length>128?this.state.dataSource[i].mark.slice(0,127)+'...':this.state.dataSource[i].mark}——《{this.state.dataSource[i].bookname.substr(0,this.state.dataSource[i].bookname.indexOf('.epub'))}》</span>,
                            });
                        }
                    }
                    this.setState({
                        listData:allListData
                    })
                })
            });
        }).catch(function(e) {
            console.log("getActive error");
        });
    }

    componentDidMount(){
        fetch('/getAllTags',{
            method:'POST',
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
              }, 
            body: "username=null"
        }).then((response) =>{
            response.json()
            .then((data)=>{
                let arrayOfTags = data.tags.split(',');
                let h = {};
                let domTags = [];
                for(let i =0 ;i<arrayOfTags.length;i++)  //对全平台的标签集合进行统计
                {
                    if(arrayOfTags[i]!='' && arrayOfTags[i].length<=20)
                    {
                        let a = arrayOfTags[i];
                        h[a] === undefined ? h[a] = 1 : (h[a]++);
                    }
                }
                let tag;
                for(tag in h)
                {
                    let size = (2*Math.sqrt(h[tag])+12)+'px';
                    domTags.push(
                        <Tooltip title={h[tag]+'个人在使用此标签'}>
                            <span className='mainTags' style={{    
                                    backgroundColor:'#'+tag.split('#')[1],
                                    fontSize:size,
                                    opacity:0.8
                                }}>
                                {tag.split('#')[0]}
                            </span>
                        </Tooltip>
                    );
                }
                this.setState({
                    tagsData:domTags
                })
            });
        }).catch(function(e) {
            console.log("getAllTags error");
        });
    }

    likes(id,likes){
        if(this.state.username=='')
        {
            message.error(`请登录！`);
            setTimeout('window.location.href="/login";',1000);
        }
        else
        {
            let newlike = likes + 1;

            fetch('/goodMark',{
                method:'POST',
                headers: { 
                    "Content-type": "application/x-www-form-urlencoded" 
                  }, 
                body: "id="+id+"&likes="+newlike
            }).then((response) =>{
                response.json()
                .then((data)=>{
                    message.success('您赞了这条标记，它将更容易被发现');
                    this.markFresh();
                })
            })
        }
    }

    readerBook(bookname){
        if(this.state.username=='')
        {
            message.error(`请登录！`);
            setTimeout('window.location.href="/login";',1000);
        }
        else
        {
            window.open('./reader/index2.html?bookname='+encodeURIComponent(bookname)+'&username='+this.state.username+'&cfi=0'+'&key='+this.state.keycheck)
        }
    }
    
    callbook(){
        fetch('/getActiveBook',{
            method:'POST',
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
              }, 
            body: "username=null"
        }).then((response) =>{
            response.json()
            .then((data)=>{
                fetch('/getWords',{
                    method:'POST',
                    headers: { 
                        "Content-type": "application/x-www-form-urlencoded" 
                      }, 
                    body: "username=null"
                }).then((response) =>{
                    response.json()
                    .then((word)=>{
                        this.setState({
                            dataBook:data,
                            markWord:word.markWord,
                            commentWord:word.commentWord
                        })
                    });
                })
            });
        }).catch(function(e) {
            console.log(e);
        });
    }

    userCard(name){
        fetch('/getAllUsers',{
            method:'POST',
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="
        }).then((response) =>{
            response.json()
            .then((users)=>{
                let temp={};
                for(let i=0;i<users.length;i++)
                {
                    temp[users[i].username] = <div>
                                                <p>注册时间：{users[i].registertime}</p>
                                                <p>藏书：{users[i].collectBooks.split(',').length-2}本</p>
                                                <p>标签：{users[i].tags.split(',').length-1}个</p>
                                            </div>
                }
                this.setState({
                    content:temp
                })
            });
        }).catch(function(e) {
            console.log(e);
        });
    }

    render() {
        var bookActive = [];
        for(var i=0;i<this.state.dataBook.length;i++){
            if(this.state.dataBook[i].douban!='undefined' && this.state.dataBook[i].douban!='' && this.state.dataBook[i].douban!=null && this.state.dataBook[i].douban[this.state.dataBook[i].douban.length-1]=='}')
            {
                let json = JSON.parse(this.state.dataBook[i].douban);
                bookActive.push(
                    <div>
                        <Popover 
                            overlayStyle={{width:'46%',position:'fixed'}}
                            placement="left" 
                            title={<span><span style={{fontSize:'1.2em',fontWeight:'bold',float:'left'}}>{this.state.dataBook[i].name.slice(0,-5)}</span><span style={{float:'right'}}>已累计{this.state.dataBook[i].markNum}条标记</span></span>}
                            content={<div>
                                        {json.author!=''?<p>作者：{json.author}</p>:null}
                                        {json.translator.length>0?<p>{json.translator}</p>:null}
                                        {json.pubdate!=''?<p>出版日期：{json.pubdate}</p>:null}
                                        {json.publisher!=''?<p>出版单位：{json.publisher}</p>:null}
                                        {json.isbn13!=''?<p>ISBN：{json.isbn13}</p>:null}
                                        {json.pages!=''?<p>页数：{json.pages}</p>:null}
                                        <p>评分：{json.rating.average} <span style={{fontSize:'0.8em'}}> (来自豆瓣阅读的{json.rating.numRaters}位读者评价)</span></p>
                                        {json.price!=''?<p>参考价格：{json.price}</p>:null}
                                        {json.summary!=''?<pre>简介：{json.summary}</pre>:null}
                                        <hr/>
                                        <p style={{fontSize:'0.8em'}}>以上内容来自第三方数据，与实际内容可能存在不一致的情况。</p>
                                    </div>}>
                            <Card
                                cover={<div style={{width:'280px',height:'350px',padding:'0'}}><img src={json.images.large} style={{display:'block',width:'100%',height:'100%'}}/></div>}
                                hoverable='true'
                                style={{display:'inline-block',border:'2px solid white'}}
                                onClick={((i)=>{ return ()=>{this.readerBook(this.state.dataBook[i].name) }})(i)}
                            >
                            </Card>
                        </Popover>
                    </div>
                )
            }
        }
        return (
            <div>
                <div style={{width:'68%',borderRadius:'2px',backgroundColor:'#fff',float:'left',padding:'10px 0 0 10px',margin:'0 0 0 10px'}}>
                    <p style={{color:'#5bc0de',fontSize:'1.2em',fontWeight:'600',textAlign:'center'}}>平台用户已累计标记{this.state.markWord}字，原创批注{this.state.commentWord}字</p>
                </div>
                <List
                    style={{width:'70%',borderRadius:'2px',backgroundColor:'#f3f3f3',float:'left'}}
                    itemLayout="vertical"
                    size="small"
                    dataSource={this.state.listData}
                    renderItem={item => (
                        <div style={{border:'1px solid #f3f3f3',overflow:'hidden',padding:'10px 10px 10px 10px',margin:'10px 10px 10px 10px',backgroundColor:'#fff'}} className='Card' >
                            <div>
                                <span><span>{item.title}</span><span style={{position:'absolute',right:'20px',color:'gray'}}>{item.time}</span></span>
                                <hr/>
                                <div>{item.description}</div>
                                <div style={{margin:'2px 0 0 0'}}>{item.content}</div>
                            </div>
                            <div style={{bottom:'2px',float:'right',margin:'5px 0 0 0'}}>
                                <Button icon="book" style={{color:'#5bc0de',borderRadius:'20px'}} title='去正文阅读~' onClick={()=>{this.state.username!=''?window.open(item.href):window.location.href='/login';}}><span >{item.bookname.substr(0,item.bookname.indexOf('.epub'))}</span></Button>
                                <Button icon="like" style={{color:'#5bc0de',borderRadius:'20px'}} title='赞这条标记~' onClick={((item)=>{return ()=>{this.likes(item.id,item.likes)}})(item)}><span >{item.likes}</span></Button>
                            </div>
                        </div>
                    )}
                />
                <div style={{position:'fixed',width:'19.5%',height:'20%',float:'right',left:'63%',top:'10%'}}>
                    <Carousel autoplay autoplaySpeed='2000'>
                        {bookActive}
                    </Carousel>
                </div>
                <div style={{position:'fixed',width:'19.5%',height:'37%',float:'right',left:'64%',bottom:'10%'}}>
                   {this.state.tagsData}
                </div>
            </div>                 
        );
    }
}
export default myIntroduce;