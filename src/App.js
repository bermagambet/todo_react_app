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
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Pencil } from "tabler-icons-react";
import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [originalTasks, setOriginalTasks] = useState([]);

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
  const taskState = useRef("");
  const taskDeadline = useRef("");

  function handleTaskSubmit() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value,
    };

    if (editing) {
      tasks[currentTaskIndex] = newTask;
      setEditing(false);
    } else {
      tasks.push(newTask);
    }

    setTasks([...tasks]);
    setOriginalTasks([...tasks]); // Update originalTasks to include the latest list
    saveTasks(tasks);
    setOpened(false);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    setOriginalTasks(updatedTasks); // Update originalTasks
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    const loadedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (loadedTasks) {
      setTasks(loadedTasks);
      setOriginalTasks(loadedTasks); // Keep a copy of the original tasks
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function sortTasks(criteria) {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (criteria === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (a.state === criteria) return -1;
      if (b.state === criteria) return 1;
      return 0;
    });
    setTasks(sortedTasks);
  }

  function filterTasks(criteria) {
    const filteredTasks = originalTasks.filter((task) => task.state === criteria);
    setTasks(filteredTasks);
  }

  function resetTasks() {
    setTasks(originalTasks); // Reset to the original list
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <div className="App">
          <Modal
            opened={opened}
            title={editing ? "Edit Task" : "New Task"}
            onClose={() => setOpened(false)}
            centered
          >
            <TextInput ref={taskTitle} label="Title" placeholder="Task Title" required />
            <TextInput
              ref={taskSummary}
              label="Summary"
              placeholder="Task Summary"
              mt="sm"
            />
            <Select
              ref={taskState}
              label="State"
              placeholder="Select state"
              mt="sm"
              data={[
                { value: "Done", label: "Done" },
                { value: "Not done", label: "Not done" },
                { value: "Doing right now", label: "Doing right now" },
              ]}
            />
            <TextInput
              ref={taskDeadline}
              label="Deadline"
              placeholder="YYYY-MM-DD"
              type="date"
              mt="sm"
            />
            <Group mt="md" position="apart">
              <Button onClick={() => setOpened(false)} variant="subtle">
                Cancel
              </Button>
              <Button onClick={handleTaskSubmit}>
                {editing ? "Save Changes" : "Create Task"}
              </Button>
            </Group>
          </Modal>
          <Container size={550} my={40}>
            <Group position="apart">
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon color="blue" onClick={toggleColorScheme} size="lg">
                {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
              </ActionIcon>
            </Group>
            <Group mt="md">
              <Button onClick={() => sortTasks("Done")}>Show 'Done' First</Button>
              <Button onClick={() => sortTasks("Doing right now")}>
                Show 'Doing' First
              </Button>
              <Button onClick={() => sortTasks("Not done")}>
                Show 'Not done' First
              </Button>
              <Button onClick={() => sortTasks("deadline")}>Sort by Deadline</Button>
            </Group>
            <Group mt="sm">
              <Button onClick={() => filterTasks("Done")}>Show Only 'Done'</Button>
              <Button onClick={() => filterTasks("Doing right now")}>
                Show Only 'Doing'
              </Button>
              <Button onClick={() => filterTasks("Not done")}>
                Show Only 'Not done'
              </Button>
              <Button onClick={resetTasks}>Show All</Button>
            </Group>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt="sm">
                  <Group position="apart">
                    <Text weight="bold">{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          setCurrentTaskIndex(index);
                          taskTitle.current.value = task.title;
                          taskSummary.current.value = task.summary;
                          taskState.current.value = task.state;
                          taskDeadline.current.value = task.deadline;
                          setEditing(true);
                          setOpened(true);
                        }}
                        color="blue"
                      >
                        <Pencil />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => deleteTask(index)}
                        color="red"
                        variant="transparent"
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color="dimmed" size="sm" mt="sm">
                    {task.summary || "No summary was provided"}
                  </Text>
                  <Text size="xs" mt="xs">
                    State: {task.state}, Deadline: {task.deadline || "N/A"}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size="lg" mt="md" color="dimmed">
                You have no tasks
              </Text>
            )}
            <Button
              onClick={() => {
                setOpened(true);
                setEditing(false);
              }}
              fullWidth
              mt="md"
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
