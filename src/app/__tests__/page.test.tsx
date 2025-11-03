import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Home", () => {
  it("should render the main heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { name: /planning poker/i });
    expect(heading).toBeInTheDocument();
  });

  it("should render create room form", () => {
    render(<Home />);
    const createButton = screen.getByRole("button", { name: /create room/i });
    expect(createButton).toBeInTheDocument();
  });

  it("should render join room form", () => {
    render(<Home />);
    const joinHeading = screen.getByRole("heading", {
      name: /join an existing room/i,
    });
    expect(joinHeading).toBeInTheDocument();
    const joinButton = screen.getByRole("button", { name: /join room/i });
    expect(joinButton).toBeInTheDocument();
  });

  it("should render strategy options", () => {
    render(<Home />);
    const strategyButtons = screen.getAllByRole("button", { name: /fibonacci|t-shirt sizes/i });
    expect(strategyButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("should render name input fields", () => {
    render(<Home />);
    const nameInputs = screen.getAllByLabelText(/your name/i);
    expect(nameInputs).toHaveLength(2); // One for create, one for join
  });

  it("should render room code input", () => {
    render(<Home />);
    const roomCodeInput = screen.getByLabelText(/room code/i);
    expect(roomCodeInput).toBeInTheDocument();
  });
});
