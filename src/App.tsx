import {
  FormEvent,
  useRef,
  KeyboardEvent,
  useState,
  ReactNode,
  Children,
  HTMLProps,
  useEffect,
  cloneElement,
  ReactElement,
  useSyncExternalStore
} from "react";
import "./App.css";

// Listening and reading from localStorage
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
  };
};

const getSnapShot = (keyName: string) => () => {
  return localStorage.getItem(keyName);
};

function FormWithArrowNavigation(props: HTMLProps<HTMLFormElement> & { children: ReactNode }) {
  const [activeField, setActiveField] = useState(0);
  const activeFieldRef = useRef<HTMLLabelElement>(null);
  const childrenLength = Children.count(props.children);

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "ArrowDown") {
      setActiveField((curr) => Math.min(childrenLength - 1, curr + 1));
    } else if (e.key === "ArrowUp") {
      setActiveField((curr) => Math.max(0, curr - 1));
    }
  };

  useEffect(() => {
    activeFieldRef.current?.focus();
  }, [activeField]);

  return (
    <form onKeyDown={handleKeyDown} {...props}>
      {Children.map(props.children, (child, index) =>
        cloneElement(child as ReactElement, {
          ref: activeField === index ? activeFieldRef : null,
          onFocus: () => setActiveField(index)
        })
      )}
    </form>
  );
}

function App() {
  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log("SUBMITTED", Object.fromEntries(formData));
    localStorage.setItem("formValue", JSON.stringify(Object.fromEntries(formData)));
    window.dispatchEvent(new StorageEvent("storage"));
  };

  const formValueString = useSyncExternalStore(subscribe, getSnapShot("formValue"));
  const formValue = formValueString ? JSON.parse(formValueString) : undefined;

  return (
    <div className="mx-auto max-w-screen-lg min-h-screen flex flex-col md:flex-row items-center justify-center">
      <div>
        <img src="/tatem-logo.png" className="w-8 h-8 mb-2 mx-auto" />
        <h1 className="text-3xl text-center mb-4">Tatem Inputs</h1>
        <div className="my-3">
          <p className="my-2">Submitted form inputs</p>
          {formValue && (
            <div className="text-left">
              <p>First name: {formValue.firstName}</p>
              <p>Last name: {formValue.lastName}</p>
              <p>Email: {formValue.email}</p>
              <p>Password: {formValue.password}</p>
            </div>
          )}
        </div>
      </div>
      <FormWithArrowNavigation className="flex mx-auto max-w-2xl flex-col items-center gap-3" onSubmit={submitForm}>
        <label className="flex flex-col items-start w-full gap-1">
          <span className="text-xs text-left text-gray-700">First Name</span>
          <input className="w-full rounded border border-gray-200 px-3 py-1.5" name="firstName" />
        </label>
        <label className="flex flex-col items-start w-full gap-1">
          <span className="text-xs text-gray-700">Last Name</span>
          <input className="w-full rounded border border-gray-200 px-3 py-1.5" name="lastName" />
        </label>
        <label className="flex flex-col items-start w-full gap-1">
          <span className="text-xs text-gray-700">Email</span>
          <input className="w-full rounded border border-gray-200 px-3 py-1.5" name="email" />
        </label>
        <label className="flex flex-col items-start w-full gap-1">
          <span className="text-xs text-gray-700">Password</span>
          <input type="password" className="w-full rounded border border-gray-200 px-3 py-1" name="password" />
        </label>
        <button
          className="mt-2 border rounded px-3 py-1.5 hover:cursor-pointer border-black hover:bg-black hover:text-white duration-150"
          type="submit"
        >
          Submit
        </button>
      </FormWithArrowNavigation>
    </div>
  );
}

export default App;
