import {
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
import { useState, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskSummary, setTaskSummary] = useState("");
  const [taskState, setTaskState] = useState("Not done");
  const [deadline, setDeadline] = useState("");

  const [filterMode, setFilterMode] = useState("All");

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  function createTask() {
    const newTask = {
      title: taskTitle,
      summary: taskSummary,
      state: taskState,
      deadline: deadline,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    saveTasks([...tasks, newTask]);
    resetModalFields();
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");
    let tasks = JSON.parse(loadedTasks);
    if (tasks) {
      setTasks(tasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  //function to reset
  function resetModalFields() {
    setTaskTitle("");
    setTaskSummary("");
    setTaskState("Not done");
    setDeadline("");
    setEditIndex(null);
    setOpened(false);
  }

  //function to open the Edit window
  function openEditModal(index) {
    const task = tasks[index];
    setTaskTitle(task.title,  "");
    setTaskSummary(task.summary,  "");
    setTaskState(task.state,  "Not done");
    setDeadline(task.deadline, "");
  setEditIndex(index);
  setOpened(true);
}
//function to save updated tasks
function saveEditedTask() {
  const updatedTask = {
    title: taskTitle,
    summary: taskSummary,
    state: taskState,
    deadline: deadline,
  };

  const updatedTasks = tasks.map((task, i) =>
    i === editIndex ? updatedTask : task
  );

  setTasks(updatedTasks);
  saveTasks(updatedTasks);
  resetModalFields();
}

function toggleFilterMode() {
  const modes = ["All", "Done", "Doing right now", "Not done"];
  const nextMode = modes[(modes.indexOf(filterMode) + 1) % modes.length];
  setFilterMode(nextMode);
}

const visibleTasks =
  filterMode === "All"
    ? tasks
    : tasks.filter((task) => task.state === filterMode);

useEffect(() => {
  loadTasks();
}, []);

return (
  <ColorSchemeProvider
    colorScheme={colorScheme}
    toggleColorScheme={toggleColorScheme}
  >
    <MantineProvider
      theme={{ colorScheme, defaultRadius: "md" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <div className="App">
        <Modal
          opened={opened}
          size={"md"}
          title={editIndex === null ? "New Task" : "Edit Task"}
          withCloseButton={false}
          onClose={resetModalFields}
          centered
        >
          <TextInput
            mt={"md"}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder={"Task Title"}
            required
            label={"Title"}
          />
          <TextInput
            mt={"md"}
            value={taskSummary}
            onChange={(e) => setTaskSummary(e.target.value)}
            placeholder={"Task Summary"}
            label={"Summary"}
          />
          <Select
            label="State"
            data={["Done", "Not done", "Doing right now"]}
            value={taskState}
            onChange={setTaskState}
            mt="md"
          />
          <TextInput
            type="date"
            label="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            mt="md"
          />
          <Group mt={"md"} position={"apart"}>
            <Button onClick={resetModalFields} variant={"subtle"}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editIndex === null ? createTask() : saveEditedTask()
              }
            >
              {editIndex === null ? "Create Task" : "Save Changes"}
            </Button>
          </Group>
        </Modal>
        <Container size={550} my={40}>
          <Group position={"apart"}>
            <Title
              sx={(theme) => ({
                fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                fontWeight: 900,
              })}
            >
              My Tasks
            </Title>
            <ActionIcon
              color={"blue"}
              onClick={() => toggleColorScheme()}
              size="lg"
            >
              {colorScheme === "dark" ? (
                <Sun size={16} />
              ) : (
                <MoonStars size={16} />
              )}
            </ActionIcon>
          </Group>
          <Group mt="sm">
            <Button onClick={toggleFilterMode}>
              Filter: {filterMode}
            </Button>
          </Group>
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task, index) => (
              <Card withBorder key={index} mt={"sm"}>
                <Group position={"apart"}>
                  <Text weight={"bold"}>{task.title}</Text>
                  <Group>
                    <ActionIcon
                      onClick={() => openEditModal(index)}
                      color={"blue"}
                      variant={"transparent"}
                    >
                      <Edit />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => deleteTask(index)}
                      color={"red"}
                      variant={"transparent"}
                    >
                      <Trash />
                    </ActionIcon>
                  </Group>
                </Group>
                <Text color={"dimmed"} size={"md"} mt={"sm"}>
                  {task.summary
                    ? task.summary
                    : "No summary was provided for this task"}
                </Text>
                <Text size={"sm"} mt={"sm"}>
                  State: {task.state}
                </Text>
                <Text size={"sm"} mt={"sm"}>
                  Deadline: {task.deadline & "No deadline set"}
                </Text>
              </Card>
            ))
          ) : (
            <Text size={"lg"} mt={"md"} color={"dimmed"}>
              You have no tasks
            </Text>
          )}
          <Button
            onClick={() => {
              setOpened(true);
            }}
            fullWidth
            mt={"md"}
          >
            New Task
          </Button>
        </Container>
      </div>
    </MantineProvider>
  </ColorSchemeProvider>
);
}