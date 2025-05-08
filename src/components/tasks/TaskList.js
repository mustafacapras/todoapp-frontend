import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const TaskList = ({ tasks, onEditTask, onDeleteTask }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#ef5350';
      case 'MEDIUM':
        return '#fb8c00';
      case 'LOW':
        return '#66bb6a';
      default:
        return '#90a4ae';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return '#66bb6a';
      case 'IN_PROGRESS':
        return '#fb8c00';
      case 'TODO':
        return '#90a4ae';
      default:
        return '#90a4ae';
    }
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : tasks
            ).map((task) => (
              <TableRow
                key={task.id}
                sx={{
                  backgroundColor: task.isVital ? 'rgba(255, 215, 0, 0.05)' : 'inherit',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {task.isVital && (
                      <Tooltip title="Vital Task">
                        <StarIcon sx={{ color: '#ffd700' }} />
                      </Tooltip>
                    )}
                    <Typography>{task.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography noWrap sx={{ maxWidth: 200 }}>
                    {task.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  {format(new Date(task.dueDate), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {task.isVital && (
                      <Tooltip title="High Priority Task">
                        <PriorityHighIcon color="error" fontSize="small" />
                      </Tooltip>
                    )}
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        bgcolor: getPriorityColor(task.priority),
                        color: 'white',
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status.replace('_', ' ')}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(task.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>{task.category}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onEditTask(task)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteTask(task.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={tasks.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default TaskList; 