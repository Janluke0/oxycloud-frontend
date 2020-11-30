import React from 'react';
//components
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'

//icons
import GetAppIcon from '@material-ui/icons/GetApp';
import ShareIcon from '@material-ui/icons/Share';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress'



function getReadableFileSizeString(fileSizeInBytes) {
  var i = -1;
  var byteUnits = [' kiB', ' MiB', ' GiB', ' TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
  } while (fileSizeInBytes > 1024);

  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
};

function saveByteArray(fileName, contentType, byte) {
  var blob = new Blob([byte], {type: contentType});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

function formatDate(date) {
  //https://stackoverflow.com/a/25275914
  var year = date.getFullYear(),
      month = date.getMonth() + 1, // months are zero indexed
      day = date.getDate(),
      hour = date.getHours(),
      minute = date.getMinutes(),
      hourFormatted = hour % 12 || 12, // hour returned in 24 hour format
      minuteFormatted = minute < 10 ? "0" + minute : minute,
      morning = hour < 12 ? "am" : "pm";

  return  day + "/" + month + "/" + year + " " + hourFormatted + ":" +
          minuteFormatted + morning;
}

export default class FileTable extends React.Component{

  constructor(props){
    super(props);
    this.api = props.api;
    this.state = {
      currentFolder: props.currentFolder || "",
      loading: true,
      files: null,
      folders: null
    };
  }
  componentDidMount(){
    this._getFilesList();
  }

  componentDidUpdate(prevProp, prevState, snapshot){
    //super.componentDidUpdate(prevProp, prevState, snapshot);
    if(prevState.currentFolder !== this.state.currentFolder){
      this.setState({loading:true});
      this._getFilesList();
    }
  }

  _getFilesList(){    
    this.api.listObjects({
      Prefix: this.state.currentFolder,
      Delimiter: "/",
      Bucket: "test-bucket"
    },this._processApiResponse.bind(this));
  }
  _processApiResponse(err,data){
    //console.log(data);
    if(err) {
      this.setState({loading:false, error:err.toString()});
      return;
    }
    var files = data.Contents.map((f)=>{
      f.Name = f.Key.split('/');
      f.Name = f.Name[f.Name.length-1];
      return f;
    });
    var folders = data.CommonPrefixes.map((f)=>{
      f.Name = f.Prefix.split('/');
      // it ends with / then the split contains a empty string as last element
      f.Name = f.Name[f.Name.length-2] + "/";
      return f;
    });
    //setTimeout(()=> //to delay response
    this.setState({
      files: files,
      folders: folders,
      loading: false
    })
    //, 3000);
  }
  startDownload(row){
    console.log("Download:", row.Key);
    this.api.getObject({
      Key:row.Key,
      Bucket: "test-bucket"},
      (err,res)=>{
        if(err) throw err;
        saveByteArray(row.Name,res.contentType,res.Body)        
      })
  }
  
  shareDialog(row){
    console.log("Sharing:", row.Key)
  }

  renderFileRow(row){
    return (
      <TableRow key={row.Key}>
      <TableCell component="th" scope="row">
        {row.Name}
      </TableCell>
      <TableCell align="right">{getReadableFileSizeString(row.Size)}</TableCell>
      <TableCell align="right">{row.Owner.DisplayName}</TableCell>
      <TableCell align="right">{formatDate(new Date(row.LastModified))}</TableCell>
      <TableCell align="right">
        <IconButton onClick={()=>this.startDownload(row)}><GetAppIcon fontSize='small'/></IconButton>
        <IconButton onClick={()=>this.shareDialog(row)}><ShareIcon fontSize='small' /></IconButton>
      </TableCell>
    </TableRow>
    )
  }

  renderFolderRow(row){
    return (
      <TableRow key={row.Prefix}>
      <TableCell component="th" scope="row">
        <Link color="inherit" onClick={()=>this.setState({currentFolder:row.Prefix})}>{row.Name}</Link>
      </TableCell>
      <TableCell align="right">-</TableCell>
      <TableCell align="right">-</TableCell>
      <TableCell align="right">-</TableCell>
      <TableCell align="right">
        <IconButton onClick={()=>this.shareDialog(row)}><ShareIcon fontSize='small' /></IconButton>
      </TableCell>
    </TableRow>
    )
  }

  renderTable() {
    if(this.state.loading){
      return (<Grid container justify="center"><CircularProgress align='center' /></Grid>)
    }
    if(this.state.error){
      return (
      <Grid containerjustify="center">
        <Typography color="error" align="center">{this.state.error}</Typography>
      </Grid>
      )
    }
    return (
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead >
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">Owner</TableCell>
              <TableCell align="right">Last modified</TableCell>
              <TableCell align="right">&nbsp;</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.folders.map((row) => (
                this.renderFolderRow(row)
            ))}
            {this.state.files.map((row) => (
                this.renderFileRow(row)
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  renderToolbarBody(){
    const f = this.state.currentFolder.split('/');
    var folders = [];
    
    folders.push(<Link color='inherit' full_path="" 
    onClick={(arg)=>this.setState({currentFolder:arg.target.attributes['full_path'].value})} >
      My folder
    </Link>);
    for (var i = 0; i < f.length-1; i++){
      var tmp = f.slice(0,i+1).join("/") +"/";
      folders.push(
        <Link color='inherit' full_path={tmp}
          onClick={(arg)=>this.setState({currentFolder:arg.target.attributes['full_path'].value})}>
         {f[i]}
        </Link>
      )
    }
    return (
      <Breadcrumbs aria-label="breadcrumb">
        {folders.map((v,i)=>{
        return v
        })}&nbsp;
      </Breadcrumbs>
    )
  }
  render(){
    //return (<Container>{this.renderToolbarBody()}{this.renderTable()} </Container>)
    return (
      <Container>
        <AppBar position='sticky' color='inherit'>
          <Toolbar>
            {this.renderToolbarBody()}
          </Toolbar>
        </AppBar>
        {this.renderTable()}
      </Container>
    );
  }

}
