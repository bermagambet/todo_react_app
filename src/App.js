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
  Checkbox,  
  CheckboxGroup,  
  Radio,
  RadioGroup
} from "@mantine/core";  
import { useState, useRef, useEffect } from "react";  
import { MoonStars, Sun, Trash } from "tabler-icons-react";  
import { MantineProvider, ColorSchemeProvider } from "@mantine/core";  
import { useHotkeys, useLocalStorage } from "@mantine/hooks";  

export default function App() {  
  const [tasks, setTasks] = useState([]);  
  const [opened, setOpened] = useState(false);  
  const [editOpened, setEditOpened] = useState(false);  
  const [editIndex, setEditIndex] = useState(null);  
  const [colorScheme, setColorScheme] = useLocalStorage({  
    key: "mantine-color-scheme",  
    defaultValue: "light",  
    getInitialValueInEffect: true,  
  });  

  const toggleColorScheme = (value) =>  
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));  

  useHotkeys([["mod+J", () => toggleColorScheme()]]);  

  const taskTitle = useRef("");  
  const taskSummary = useRef("");  
  const taskDeadline = useRef("");  
  const [checkState, setCheckState] = useState([]); // Start as an empty array
  const handleCheckState = (value) => {  
    setCheckState(value); 
  };  

  useEffect(() => {  
    loadTasks();  
  }, []);  

  const loadTasks = () => {  
    let loadedTasks = localStorage.getItem("tasks");  
    let tasks = JSON.parse(loadedTasks);  
    if (tasks) {  
      setTasks(tasks);  
    }  
  };  

  const saveTasks = (tasks) => {  
    localStorage.setItem("tasks", JSON.stringify(tasks));  
  };  

  const createTask = () => {  
    const newTask = {  
      title: taskTitle.current.value,  
      summary: taskSummary.current.value,  
      deadline: taskDeadline.current.value,  
      state: checkState.length > 0 ? checkState : ["Not Done"], 
    };  
  
    setTasks((prevTasks) => [...prevTasks, newTask]);  
    saveTasks([...tasks, newTask]);  
    
    taskTitle.current.value = "";  
    taskSummary.current.value = "";  
    taskDeadline.current.value = "";  
    setCheckState([]); 
  };  
  
  const editTask = () => {  
    if (editIndex !== null) {  
      const editedTask = {  
        title: taskTitle.current.value,  
        summary: taskSummary.current.value,  
        deadline: taskDeadline.current.value,  
        state: checkState,
      };  
  
      const clonedTasks = [...tasks];  
      clonedTasks[editIndex] = editedTask; 
      setTasks(clonedTasks);  
      saveTasks(clonedTasks);  
      setEditIndex(null);  
      setEditOpened(false);  
    }  
  };  

   function deleteTask(index) {
    var clonedTasks = [...tasks];

    clonedTasks.splice(index, 1);
    clonedTasks.filter((task, i) => clonedTasks[index] !== task  );

    setTasks(clonedTasks);
    saveTasks(clonedTasks);
  } 

  const sortTasks = (state) => {  
    const sortedTasks = [...tasks].sort((a, b) => {  
      if (a.state.toString() === state.toString() && b.state.toString() !== state.toString()) return -1;  
      if (a.state.toString() !== state.toString() && b.state.toString() === state.toString()) return 1;  
      return 0;  
    });  
    setTasks(sortedTasks);  
  };  
  const sortByDeadline = (deadline) => {  
    const sortedTasks = [...tasks].sort((a, b) => {  
      if (a.deadline === deadline && b.deadline !== deadline) return -1;  
      if (a.deadline !== deadline() && b.deadline === deadline) return 1;  
      return 0;  
    });  
    setTasks(sortedTasks);  
  };  

  const filterTasks = (state) => {  
    const filteredTasks = [...tasks].filter(task => task.state.toString() === state.toString());  
    setTasks(filteredTasks);  
  };  

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
          {/* New Task Modal */}  
          <Modal  
            opened={opened}  
            size={"md"}  
            title={"New Task"}  
            onClose={() => setOpened(false)}  
            centered  
          >  
            <TextInput  
              mt={"md"}  
              ref={taskTitle}  
              placeholder={"Task Title"}  
              required  
              label={"Title"}  
            />  
            <TextInput  
              ref={taskSummary}  
              mt={"md"}  
              placeholder={"Task Summary"}  
              label={"Summary"}  
            />  
            <TextInput  
              ref={taskDeadline}  
              mt={"md"}  
              placeholder={"Task Deadline"}  
              label={"Deadline"}  
              type="date"  
            />  
            {/* <CheckboxGroup value={checkState} onChange={handleCheckState}>  
                <Checkbox value="Done" label="Done" />  
                <Checkbox value="Not Done" label="Not Done" />  
                <Checkbox value="Doing" label="Doing Right Now" />  
            </CheckboxGroup>    */}
            <RadioGroup value={[checkState]} onChange={handleCheckState}>  
              <Radio value="Done" label="Done" />  
              <Radio value="Not Done" label="Not Done" />  
              <Radio value="Doing" label="Doing Right Now" />  
            </RadioGroup>  
            <Group mt={"md"} position={"apart"}>  
              <Button onClick={() => setOpened(false)} variant={"subtle"}>  
                Cancel  
              </Button>  
              <Button onClick={createTask}>Create Task</Button>  
            </Group>  
          </Modal>  

         
          <Modal  
            opened={editOpened}  
            size={"md"}  
            title={"Edit Task"}  
            onClose={() => setEditOpened(false)}  
            centered  
          >  
            <TextInput  
              mt={"md"}  
              ref={taskTitle}  
              placeholder={"Task Title"}  
              required  
              label={"Title"}  
            />  
            <TextInput  
              ref={taskSummary}  
              mt={"md"}  
              placeholder={"Task Summary"}  
              label={"Summary"}  
            />  
            <TextInput  
              ref={taskDeadline}  
              mt={"md"}  
              placeholder={"Task Deadline"}  
              label={"Deadline"}  
              type="date"  
            /> 
 
            <RadioGroup value={[checkState]} onChange={handleCheckState}>  
              <Radio value="Done" label="Done" />  
              <Radio value="Not Done" label="Not Done" />  
              <Radio value="Doing" label="Doing Right Now" />  
            </RadioGroup>  
            <Group mt={"md"} position={"apart"}>  
              <Button onClick={() => setEditOpened(false)} variant={"subtle"}>  
                Cancel  
              </Button>  
              <Button onClick={editTask}>Edit Task</Button>  
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
                {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}  
              </ActionIcon>  
            </Group>  

            {/* Sort and Filter Buttons */}  
            <Group>  
              <Button onClick={() => sortTasks("Done")}>Show 'Done' first</Button>  
              <Button onClick={() => sortTasks("Doing")}>Show 'Doing' first</Button>  
              <Button onClick={() => sortTasks("Not Done")}>Show 'Not Done' first</Button>  
            </Group>  
            <Group mt={"md"}>  
              <Button onClick={() => filterTasks("Done")}>Show only 'Done'</Button>  
              <Button onClick={() => filterTasks("Doing")}>Show only 'Doing'</Button>  
              <Button onClick={() => filterTasks("Not Done")}>Show only 'Not Done'</Button>  
            </Group>  
            <Button onClick={sortByDeadline}>SortByDeadline</Button>

            {tasks.length > 0 ? (  
              tasks.map((task, index) => (  
                <Card withBorder key={index} mt={"sm"}>  
                  <Group position={"apart"}>  
                    <Text weight={"bold"}>{task.title}</Text>  
                    <Text>{task.state}</Text>
                    <Group>  
                      <ActionIcon  
                        onClick={() => {  
                          deleteTask(index);  
                        }}  
                        color={"red"}  
                        variant={"transparent"}  
                      >  
                        <Trash />  
                      </ActionIcon>  
                      <ActionIcon  
                        color={"blue"}  
                        variant={"transparent"}  
                        onClick={() => {  
                          setEditOpened(true);  
                          setEditIndex(index);  
                          if (taskTitle.current) taskTitle.current.value = task.title || "";  
                          if (taskSummary.current) taskSummary.current.value = task.summary || "";  
                          if (taskDeadline.current) taskDeadline.current.value = task.deadline || "";  
                          setCheckState(task.state);  
                      }}  >  
                        Edit  
                      </ActionIcon>  
                    </Group>  
                  </Group>  
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>  
                    {task.summary ? task.summary : "No summary was provided for this task"}  
                  </Text>  
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>  
                    Deadline: {task.deadline ? task.deadline : "No deadline set"}  
                  </Text>  
                </Card>  
              ))  
            ) : (  
              <Text size={"lg"} mt={"md"} color={"dimmed"}>  
                You have no tasks  
              </Text>  
            )}  
            
            <Button  
              onClick={() => setOpened(true)}  
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