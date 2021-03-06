import React from "react";
import { findByText, fireEvent, render, waitFor } from "@testing-library/react";
import UserPage from "./UserPage";
import * as apiCalls from "../api/apiCalls";
import axios from "axios";
import { Provider } from "react-redux";
import configureStore from "../redux/configureStore";
import { wait } from "@testing-library/user-event/dist/utils";

const mockSuccessGetUser = {
  data: {
    id: 1,
    username: "user1",
    displayName: "display1",
    image: "profile1.png",
  },
};

const mockSuccessUpdateUser = {
  data: {
    id: 1,
    username: "user1",
    displayName: "display1-update",
    image: "profile1-update.png",
  },
};

const mockFailGetUser = {
  response: {
    data: {
      message: "User not found",
    },
  },
};

const mockFailUpdateUser = {
  response: {
    data: {},
  },
};

const match = {
  params: {
    username: "user1",
  },
};

const setup = (props) => {
  const store = configureStore(false);
  return render(
    <Provider store={store}>
      <UserPage {...props} />
    </Provider>
  );
};

beforeEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common["Authorization"];
});

const setUserOneLoggedInStorage = () => {
  localStorage.setItem(
    "hoax-auth",
    JSON.stringify({
      id: 1,
      username: "user1",
      displayName: "display1",
      image: "profile1.png",
      password: "P4ssword",
      isLoggedIn: true,
    })
  );
};

describe("UserPage", () => {
  describe("Layout", () => {
    it("has root page div", () => {
      const { queryByTestId } = setup();
      const userPageDiv = queryByTestId("userpage");
      expect(userPageDiv).toBeInTheDocument();
    });
    it("displays the displayName@username when user data loaded", async () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const { findByText } = setup({ match });
      const text = await findByText("display1@user1");
      expect(text).toBeInTheDocument();
    });
    it("displays not found alert when user not found", async () => {
      apiCalls.getUser = jest.fn().mockRejectedValue(mockFailGetUser);
      const { findByText } = setup({ match });
      const alert = await findByText("User not found");
      expect(alert).toBeInTheDocument();
    });
    it("displays spinner while loading user data", () => {
      const mockDelayedResponse = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetUser);
          }, 300);
        });
      });
      apiCalls.getUser = mockDelayedResponse;
      const { queryByText } = setup({ match });
      const spinner = queryByText("Loading...");
      expect(spinner).toBeInTheDocument();
    });
    it("displays the edit button when loggedInUser matches to user in url", async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const { queryByText, findByText } = setup({ match });
      await findByText("display1@user1");
      const editButton = queryByText("Edit");
      expect(editButton).toBeInTheDocument();
    });
  });
  describe("Lifecycle", () => {
    it("calls getUser when it is rendered", () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      setup({ match });
      expect(apiCalls.getUser).toHaveBeenCalledTimes(1);
    });
    it("calls getUser for user1 when it is rendred with user1 in match", () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      setup({ match });
      expect(apiCalls.getUser).toHaveBeenCalledWith("user1");
    });
  });
  describe("Profile Interactions", () => {
    const setupForEdit = async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const rendered = setup({ match });
      const editButton = await rendered.findByText("Edit");
      fireEvent.click(editButton);
      return rendered;
    };
    const mockDelayedUpdateSuccess = () => {
      return jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessUpdateUser);
          }, 300);
        });
      });
    };
    it("displays edit layout when clicking edit button", async () => {
      const { queryByText } = await setupForEdit();
      expect(queryByText("Save")).toBeInTheDocument();
    });
    it("returns back to none edit mode after clicking cancel", async () => {
      const { queryByText } = await setupForEdit();
      const cancelButton = queryByText("Cancel");
      fireEvent.click(cancelButton);
      expect(queryByText("Edit")).toBeInTheDocument();
    });
    it("calls updateUser api when clicking save", async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByText("Save");
      fireEvent.click(saveButton);

      const userId = apiCalls.updateUser.mock.calls[0][0];

      expect(userId).toBe(1);
      //expect(apiCalls.updateUser).toHaveBeenCalledTimes(1);
    });
    it("calls updateUser api with request body having changed displayName", async () => {
      const { queryByText, container } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const displayInput = container.querySelector("input");
      fireEvent.change(displayInput, { target: { value: "display1-update" } });

      const saveButton = queryByText("Save");
      fireEvent.click(saveButton);

      const requestBody = apiCalls.updateUser.mock.calls[0][1];
      expect(requestBody.displayName).toBe("display1-update");
    });
    it("returns to non edit mode after successful updateUser api call", async () => {
      const { queryByText, findByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByText("Save");
      fireEvent.click(saveButton);
      const editButtonAfterClickingSave = await findByText("Edit");

      expect(editButtonAfterClickingSave).toBeInTheDocument();
    });
    it("returns to original displayName after its changed in edit mode but cancelled", async () => {
      const { queryByText, container } = await setupForEdit();
      const displayInput = container.querySelector("input");
      fireEvent.change(displayInput, { target: { value: "display1-update" } });

      const cancelButton = queryByText("Cancel");
      fireEvent.click(cancelButton);

      const originalDisplayText = queryByText("display1@user1");
      expect(originalDisplayText).toBeInTheDocument();
    });
    it("returns to last updated displayName when display name is changed for another time but cancelled", async () => {
      const { queryByText, findByText, container, queryByRole } =
        await setupForEdit();

      let displayInput = container.querySelector("input");
      fireEvent.change(displayInput, { target: { value: "display1-update" } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole("button", { name: "Save" });
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await findByText("Edit");
      fireEvent.click(editButtonAfterClickingSave);

      displayInput = container.querySelector("input");
      fireEvent.change(displayInput, {
        target: { value: "display1-update-second-time" },
      });

      const cancelButton = queryByText("Cancel");
      fireEvent.click(cancelButton);

      const lastSavedData = container.querySelector("h4");

      expect(lastSavedData).toHaveTextContent("display1-update@user1");
    });
    it("displays spinner when there is updateUser api call", async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByText("Save");
      fireEvent.click(saveButton);
      const spinner = queryByText("Loading...");
      expect(spinner).toBeInTheDocument();
    });
    it("disables save button when there is updateUser api call", async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByText("Save");
      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
    });
    it("disables cancel button when there is updateUser api call", async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByText("Save");
      fireEvent.click(saveButton);

      const cancelButton = queryByText("Cancel");

      expect(cancelButton).toBeDisabled();
    });
    it("enables save button after updateUser api call success", async () => {
      const { queryByText, container, findByText, queryByRole } =
        await setupForEdit();
      let displayInput = container.querySelector("input");
      fireEvent.change(displayInput, { target: { value: "display1-update" } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByRole("button", { name: "Save" });
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await findByText("Edit");

      fireEvent.click(editButtonAfterClickingSave);

      const saveButtonAfterSecondEdit = queryByText("Save");

      expect(saveButtonAfterSecondEdit).not.toBeDisabled();
    });
    it("enables save button after updateUser api call fails", async () => {
      const { queryByRole, container } = await setupForEdit();
      let displayInput = container.querySelector("input");
      fireEvent.change(displayInput, { target: { value: "display1-update" } });
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByRole("button", { name: "Save" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });
});

console.error = () => {};
