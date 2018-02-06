import React, { Component } from 'react';
import {Form,Input,Checkbox,Button,Tabs,Table,Icon,message,Divider,Switch} from 'antd';
import BookUpload from './bookUpload';
const Search = Input.Search;
const TabPane = Tabs.TabPane;
class BookManager extends Component { 
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
            dataSource:[],
            username:username,
            memory:0,
            key:keycheck,
            allData:[],
            collectBooks:'',
            stateBtn:false,
            markAllNum:0
        };
        this.callback=this.callback.bind(this);
        this.delete=this.delete.bind(this);
        this.search=this.search.bind(this);
        this.marks=this.marks.bind(this);
        this.collect=this.collect.bind(this);
        this.collectBooks=this.collectBooks.bind(this);
        this.cancelCollect=this.cancelCollect.bind(this);
        this.callback();
        fetch('/getUserTags',{
            method:'POST' ,
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="+this.state.username
        }).then(
              response => response.json()
        ).then( (user)=> { 
            this.setState({
                collectBooks:user[0].collectBooks
            })
        })
    }

    collect(record){
        fetch('/collectBook',{
            method:'POST' ,
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="+this.state.username+"&collectBookId="+record.id
        }).then(
            response => response.json()
        ).then(function (data) {
            if(data.ok=='1')
            {
                message.success(`收藏成功!`);
                setTimeout("window.location.reload()",400)
            }
            else
            {
                message.info(`这本书已经收藏过了~`);
            }
        }).catch(function (error) { 
            message.error(`网络错误!`);
        })
    }

    cancelCollect(record){
        fetch('/cancelCollectBook',{
            method:'POST' ,
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="+this.state.username+"&collectBookId="+record.id
        }).then(
            response => response.json()
        ).then(function (data) {
            if(data.ok=='1')
            {
                message.success(`取消成功!`);
                setTimeout("window.location.reload()",400)
            }
            else
            {
                message.info(`取消失败！`);
            }
        }).catch(function (error) { 
            message.error(`网络错误!`);
        })
    }

    collectBooks(){
        if(this.state.stateBtn==true)
        {
            let size=0;
            let mark=0;
            for(let i=0;i<this.state.allData.length;i++)
            {
                size=size+this.state.allData[i].size;
                mark=mark+this.state.allData[i].markNum;
            }
            this.setState({
                dataSource:this.state.allData,
                stateBtn:false,
                memory:size,
                markAllNum:mark
            })
        }
        else
        {
            fetch('/getUserTags',{
                method:'POST' ,
                headers: { 
                    "Content-type": "application/x-www-form-urlencoded" 
                }, 
                body: "username="+this.state.username
            }).then(
                  response => response.json()
            ).then( (user)=> { 
                let books = user[0].collectBooks.split(',');
                var otherDataSource = [];
                var size=0;
                var mark=0;
                if(books.length==2)
                {
                    this.setState({
                        dataSource:[],
                        stateBtn:true
                    })
                }
                else
                {
                    for(var i=1;i<books.length-1;i++)
                    {
                        fetch('/getBookFromId',{
                            method:'POST' ,
                            headers: { 
                                "Content-type": "application/x-www-form-urlencoded" 
                            }, 
                            body: "id="+books[i]
                        }).then(response => response.json())
                        .then((book)=> {
                            otherDataSource.push(book[0]);
                            size = size + book[0].size;
                            mark = mark + book[0].markNum;
                            this.setState({
                                dataSource:otherDataSource,
                                memory:size,
                                stateBtn:true,
                                markAllNum:mark
                            })
                        })
                    }
                }
            }).catch(function (error) { 
                  console.log(error)
            })
        }
    }

    search(value){
        var otherDataSource = [];
        let size=0;
        let mark=0;
        for(var i=0;i<this.state.allData.length;i++)
        {
            if(this.state.allData[i].name.indexOf(value)>=0)
            {
                size=size+this.state.allData[i].size;
                mark=mark+this.state.allData[i].markNum;
                otherDataSource.push(this.state.allData[i]);
            }
        }
        this.setState({
            dataSource:otherDataSource,
            markAllNum:mark,
            memory:size
        })
    }

    delete(record){
        fetch('/delete',{
            method:'POST' ,
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "bookname="+record.name
        }).then(
              response => response.json()
        ).then(function (data) { 
            if(data.delete=='1')
            {
                message.success(`删除成功!`);
                setTimeout("window.location.reload()",400)
            }
            else
                message.error(`删除失败!`);
        }).catch(function (error) { 
              message.error(`网络错误!`);
        })
          
    }

    marks(record){
        let marks = this.refs.marks;
        fetch('/getUserMarks',{
            method:'POST' ,
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "bookname="+record.name
        }).then(
              response => response.json()
        ).then(function (data) { 
            marks.style.display='block';
            if(data.length==0)
            {
                marks.innerHTML=`
                &nbsp;<span style="font-weight:bold;">&nbsp;${record.name.slice(0,-5)}&nbsp;</span>已有&nbsp;<span style="font-size:1.2em;color:blue">0</span>&nbsp;条标记。
                <hr/>
                `;
            }
            else
            {
                let markItem='<p>';
                for(let i=0;i<data.length;i++)
                {
                    if(data[i].tag=='分享' && data[i].comment!='')
                        markItem = markItem + '<span style="color:blue;">' + data[i].username + '</span>' + '&nbsp;说：' + data[i].comment + '</p><p>'
                }
                markItem = markItem + '</p>';
                marks.innerHTML=`
                    &nbsp;<span style="font-weight:bold;">&nbsp;${record.name.slice(0,-5)}&nbsp;</span>已有&nbsp;<span style="font-size:1.2em;color:blue">${data.length}</span>&nbsp;条标记。
                    <br/>
                    <span>&nbsp;最新一条标记于${data[data.length-1].time}</span>
                    <hr/>
                    ${markItem}
                    `;
            }
            
        }).catch(function (error) { 
            console.log(error)
            message.error(`网络错误!`);
        })
          
    }

    callback() {
        var mem=0;
        var mark=0;
        fetch('/getBooks',{
            method:'POST' ,
            headers: { 
                "Content-type": "application/x-www-form-urlencoded" 
            }, 
            body: "username="+this.state.username
        }).then((response) =>{
            //打印返回的json数据
            response.json().then((data)=>{
                for(var i=0;i<data.length;i++)
                {
                    mem = mem + parseInt(data[i].size);
                    mark = mark + parseInt(data[i].markNum);
                }
                this.setState({
                    dataSource:data,
                    memory:mem,
                    allData:data,
                    markAllNum:mark
                })
            });
        }).catch(function(e) {
            console.log("getBooks error");
        });
        
    }
  
    render() {
        const columns = [{
            title: '图书编号',
            dataIndex: 'id',
            key: 'id',
        },{
            title: '书名',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <span>{text.slice(0,text.indexOf('.epub'))}</span>
            )
        },{
            title: '大小(总计'+(this.state.memory/1048576).toFixed(1)+'mb)',
            dataIndex: 'size',
            key: 'size',
            sorter: (a, b) => a.size - b.size,
            render: (text, record) => (
                text.toString().length<=6 ?
                <span>{(text/1024).toFixed(1)} kb</span>
                : <span>{(text/1048576).toFixed(1)} mb</span>
            )
        },{
            title: '标记量(总计'+this.state.markAllNum+'条)',
            dataIndex: 'markNum',
            key: 'markNum',
            sorter: (a, b) => a.markNum - b.markNum,
            render:(text,record)=>(
                <a href="javascript:;" onMouseOver={()=>this.marks(record)} onMouseOut={()=>{this.refs.marks.style.display='none'}}>{text}</a>
            )
        },{
            title: '操作',
            key: 'action',
            render: (text, record)=>{
                if(this.state.collectBooks.indexOf(record.id)<0)
                {
                    if(this.state.username=='%E8%82%96%E5%85%86%E7%90%A6')
                    {
                        return (
                        <span>
                            <a href={'./reader/index2.html?bookname='+encodeURIComponent(record.name)+'&username='+this.state.username+'&cfi=0'+'&key='+this.state.key} target="_blank">阅读本书</a>
                            <Divider type="vertical" />
                            <a href={'./reader/book/'+record.name} download={''+record.name}>下载本书</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>this.delete(record)}>删除</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>this.collect(record)}>收藏</a>
                        </span>)
                    }
                    else
                    {
                        return (
                        <span>
                            <a href={'./reader/index2.html?bookname='+encodeURIComponent(record.name)+'&username='+this.state.username+'&cfi=0'+'&key='+this.state.key} target="_blank">阅读本书</a>
                            <Divider type="vertical" />
                            <a href={'./reader/book/'+record.name} download={''+record.name}>下载本书</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>this.collect(record)}>收藏</a>
                        </span>)
                    }
                }
                else
                {
                    if(this.state.username=='%E8%82%96%E5%85%86%E7%90%A6')
                    {
                        return (
                        <span>
                            <a href={'./reader/index2.html?bookname='+encodeURIComponent(record.name)+'&username='+this.state.username+'&cfi=0'+'&key='+this.state.key} target="_blank">阅读本书</a>
                            <Divider type="vertical" />
                            <a href={'./reader/book/'+record.name} download={''+record.name}>下载本书</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>this.delete(record)}>删除</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" style={{color:'red'}} onClick={()=>this.cancelCollect(record)}>取消收藏</a>
                        </span>)
                    }
                    else
                    {
                        return (
                        <span>
                            <a href={'./reader/index2.html?bookname='+encodeURIComponent(record.name)+'&username='+this.state.username+'&cfi=0'+'&key='+this.state.key} target="_blank">阅读本书</a>
                            <Divider type="vertical" />
                            <a href={'./reader/book/'+record.name} download={''+record.name}>下载本书</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" style={{color:'red'}} onClick={()=>this.cancelCollect(record)}>取消收藏</a>
                        </span>)
                    }
                }
                
            }
        }];
        return (
            <div className='Card' style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                <Tabs  onChange={this.callback} type="card">
                    <TabPane tab="图书仓库" key="1">
                        <Search
                            placeholder="按书名搜索..."
                            onSearch={this.search}
                            enterButton='搜索'
                            style={{width:'40%'}}
                        />
                        <Switch style={{float:'right',position:'relative',top:'5px'}} ref='collect' onChange={this.collectBooks} checkedChildren="收藏" unCheckedChildren="收藏" />
                        <br/><br/>
                        <Table columns={columns} dataSource={this.state.dataSource} />
                    </TabPane>
                    <TabPane tab="贡献新书" key="2">
                        <BookUpload/>
                    </TabPane>
                </Tabs>
                <div className='Card' ref="marks" style={{borderRadius:'10px',boxShadow:'1px 1px 15px #888888',position:'fixed',left:'15%',right:'55%',top:'30%',width:'30%',height:'30%',display:'none'}}></div>
            </div>                    
        );
    }
}
export default BookManager;