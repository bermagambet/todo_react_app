import {
  MantineProvider, // From @mantine/core
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";

import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";
import { useHotkeys, useLocalStorage } from "@mantine/hooks"; 


export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("Not done");
  const taskDeadline = useRef("");

  function createTask() {
    if (editTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editTask.id
            ? {
                ...task,
                title: taskTitle.current.value,
                summary: taskSummary.current.value,
                state: taskState.current.value,
                deadline: taskDeadline.current.value,
              }
            : task
        )
      );
      setEditTask(null);
    } else {
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: Date.now(),
          title: taskTitle.current.value,
          summary: taskSummary.current.value,
          state: taskState.current.value,
          deadline: taskDeadline.current.value,
        },
      ]);
    }
    resetModal();
  }

  function resetModal() {
    setOpened(false);
    taskTitle.current.value = "";
    taskSummary.current.value = "";
    taskState.current.value = "Not done";
    taskDeadline.current.value = "";
    setEditTask(null);
  }

  function deleteTask(index) {
    setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
  }

  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function getFilteredAndSortedTasks() {
    let filteredTasks = [...tasks];
    if (filter) filteredTasks = filteredTasks.filter((task) => task.state === filter);

    if (sortBy === "deadline") {
      filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sortBy) {
      filteredTasks.sort((a, b) => (a.state === sortBy ? -1 : 1));
    }

    return filteredTasks;
  }

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  return (
    <MantineProvider
      theme={{ colorScheme }}
      withGlobalStyles
      withNormalizeCSS
    >
      <div className="App">
        <Modal
          opened={opened}
          size="md"
          title={editTask ? "Edit Task" : "New Task"}
          onClose={resetModal}
          centered
        >
          <TextInput
            ref={taskTitle}
            label="Title"
            placeholder="Task Title"
            required
            defaultValue={editTask?.title || ""}
          />
          <TextInput
            ref={taskSummary}
            label="Summary"
            placeholder="Task Summary"
            defaultValue={editTask?.summary || ""}
          />
          <Select
            ref={taskState}
            label="State"
            data={["Not done", "Doing right now", "Done"]}
            defaultValue={editTask?.state || "Not done"}
          />
          <TextInput
            ref={taskDeadline}
            label="Deadline"
            type="date"
            defaultValue={editTask?.deadline || ""}
          />
          <Group mt="md" position="apart">
            <Button variant="subtle" onClick={resetModal}>
              Cancel
            </Button>
            <Button onClick={createTask}>
              {editTask ? "Save Changes" : "Create Task"}
            </Button>
          </Group>
        </Modal>
        <Container size={550} my={40}>
          <Group position="apart">
            <Title>My Tasks</Title>
            <ActionIcon size="lg" onClick={toggleColorScheme}>
              {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
            </ActionIcon>
          </Group>
          <Group mt="md">
            <Button onClick={() => setSortBy("Done")}>Show "Done" First</Button>
            <Button onClick={() => setSortBy("Doing right now")}>
              Show "Doing" First
            </Button>
            <Button onClick={() => setSortBy("Not done")}>
              Show "Not Done" First
            </Button>
            <Button onClick={() => setSortBy("deadline")}>
              Sort by Deadline
            </Button>
          </Group>
          <Group mt="md">
            <Button onClick={() => setFilter("Done")}>Show Only "Done"</Button>
            <Button onClick={() => setFilter("Doing right now")}>
              Show Only "Doing"
            </Button>
            <Button onClick={() => setFilter("Not done")}>
              Show Only "Not Done"
            </Button>
            <Button onClick={() => setFilter("")}>Clear Filter</Button>
          </Group>
          {getFilteredAndSortedTasks().length > 0 ? (
            getFilteredAndSortedTasks().map((task, index) => (
              <Card key={task.id} withBorder mt="sm">
                <Group position="apart">
                  <Text weight="bold">{task.title}</Text>
                  <Group>
                    <ActionIcon
                      color="blue"
                      onClick={() => {
                        setEditTask(task);
                        setOpened(true);
                      }}
                    >
                      <Edit />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => deleteTask(index)}
                    >
                      <Trash />
                    </ActionIcon>
                  </Group>
                </Group>
                <Text size="md" color="dimmed" mt="sm">
                  {task.summary || "No summary provided"}
                </Text>
                <Text size="sm" color="dimmed">
                  State: {task.state}
                </Text>
                <Text size="sm" color="dimmed">
                  Deadline: {task.deadline || "No deadline set"}
                </Text>
              </Card>
            ))
          ) : (
            <Text size="lg" mt="md" color="dimmed">
              You have no tasks
            </Text>
          )}
          <Button
            fullWidth
            mt="md"
            onClick={() => {
              setEditTask(null);
              setOpened(true);
            }}
          >
            New Task
          </Button>
        </Container>
      </div>
    </MantineProvider>
  );
}



