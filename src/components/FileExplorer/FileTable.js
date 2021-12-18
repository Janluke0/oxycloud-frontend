import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import FileRow from "./FileRow"
import FolderRow from "./FolderRow"

import { OxySession } from "../../utils/api"

import { useQuery } from 'react-query';

const FileTable = ({ 
    folder, on_share, on_download, on_change_folder, on_rm, on_rename, 
    enable_rm, enable_download, enable_sharing, enable_rename }) => {
  const FSTree = useQuery(["fsTree", folder], () => OxySession.storage.ls(folder))
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Size</TableCell>
            <TableCell align="right">Owner</TableCell>
            <TableCell align="right">Last modified</TableCell>
            <TableCell align="right">&nbsp;</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {FSTree.data.folders.map((f) =>
            <FolderRow
              id={f.id}
              name={f.name}
              path={f.path}
              on_share={on_share}
              on_change_folder={on_change_folder}
              enable_rm={enable_rm}
              enable_download={enable_download}
              enable_sharing={enable_sharing}
            />)}
          {FSTree.data.files.map((f) =>
            <FileRow
              file={f}
              on_share={on_share}
              on_download={on_download}
              on_rm={on_rm}
              on_rename={on_rename}
              enable_rm={enable_rm}
              enable_download={enable_download}
              enable_sharing={enable_sharing}
              enable_rename={enable_rename}
            />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default FileTable;
