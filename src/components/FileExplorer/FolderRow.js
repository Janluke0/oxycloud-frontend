import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Link from '@material-ui/core/Link'
import {faFolderOpen} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const FolderRow = ({ path, name, on_share: share, on_change_folder: change_folder }) => {
  return (
    <TableRow key={path}>
      <TableCell component="th" scope="row">
        <FontAwesomeIcon icon={faFolderOpen}></FontAwesomeIcon>{' '}
        <Link color="inherit" onClick={() => change_folder(path)}>{name}</Link>
      </TableCell>

      <TableCell align="right">-</TableCell>
      <TableCell align="right">-</TableCell>
      <TableCell align="right">-</TableCell>
      <TableCell align="right">
      </TableCell>
    </TableRow>
  )
}
export default FolderRow;
