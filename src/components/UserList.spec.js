import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import UserList from "./UserList";
import * as apiCalls from "../api/apiCalls";

apiCalls.listUsers = jest.fn().mockResolvedValue({
  data: {
    content: [],
    number: 0,
    size: 3,
  },
});

const setup = () => {
  return render(<UserList />);
};

const mockedEmptySuccessResponse = {
  data: {
    content: [],
    number: 0,
    size: 3,
  },
};

const mockSuccessGetSinglePage = {
  data: {
    content: [
      {
        username: "user1",
        displayName: "display1",
        image: "",
      },
      {
        username: "user2",
        displayName: "display2",
        image: "",
      },
      {
        username: "user3",
        displayName: "display3",
        image: "",
      },
    ],
    number: 0,
    first: true,
    last: true,
    size: 3,
    totalPages: 1,
  },
};

const mockSuccessGetMultiPageFirst = {
  data: {
    content: [
      {
        username: "user1",
        displayName: "display1",
        image: "",
      },
      {
        username: "user2",
        displayName: "display2",
        image: "",
      },
      {
        username: "user3",
        displayName: "display3",
        image: "",
      },
    ],
    number: 0,
    first: true,
    last: false,
    size: 3,
    totalPages: 2,
  },
};

const mockSuccessGetMultiPageLast = {
  data: {
    content: [
      {
        username: "user4",
        displayName: "display4",
        image: "",
      },
    ],
    number: 1,
    first: false,
    last: true,
    size: 3,
    totalPages: 2,
  },
};

describe("UserList", () => {
  describe("Layout", () => {
    it("has header of Users", () => {
      const { container } = setup();
      const header = container.querySelector("h3");
      expect(header).toHaveTextContent("Users");
    });
    it("displays three items when listUser api returns three users", async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetSinglePage);
      const { queryByTestId } = setup();
      // This is the old version
      //   await waitForDomChange();
      //   const userGroup = queryByTestId("usergroup");
      //   expect(userGroup.childElementCount).toBe(3);
      await waitFor(() => {
        const userGroup = queryByTestId("usergroup");
        expect(userGroup.childElementCount).toBe(3);
      });
    });
    it("displays the displayName@username when listUser api returns users", async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetSinglePage);
      const { findByText } = setup();
      const firstUser = await findByText("display1@user1");
      expect(firstUser).toBeInTheDocument();
    });
    it("displays the next button when response has last value as false", async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetMultiPageFirst);
      const { findByText } = setup();
      const nextLink = await findByText("next >");
      expect(nextLink).toBeInTheDocument();
    });
  });
  describe("Lifecycle", () => {
    it("calls listUsers api when it is rendered", () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedEmptySuccessResponse);
      setup();
      expect(apiCalls.listUsers).toHaveBeenCalledTimes(1);
    });
    it("calls listUsers method with page zero and size three", () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedEmptySuccessResponse);
      setup();
      expect(apiCalls.listUsers).toHaveBeenCalledWith({ page: 0, size: 3 });
    });
  });
  describe("Interactions", () => {
    it("loads next page when clicked to next button", async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValueOnce(mockSuccessGetMultiPageFirst)
        .mockResolvedValueOnce(mockSuccessGetMultiPageLast);
      const { findByText } = setup();
      const nextLink = await findByText("next >");
      fireEvent.click(nextLink);

      const secondPageUser = await findByText("display4@user4");

      expect(secondPageUser).toBeInTheDocument();
    });
  });
});

console.error = () => {};
