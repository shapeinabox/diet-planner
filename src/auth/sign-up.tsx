import {
  Button,
  IconButton,
  Stack,
  FormControl,
  FormLabel,
  Input,
} from "@mui/joy";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Stack spacing={4}>
      <form onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="Add your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endDecorator={
              <IconButton
                aria-label="Show password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            }
          />
        </FormControl>
        <Button disabled={!password || !email} type="submit">
          Sign-up
        </Button>
      </form>
    </Stack>
  );
};
