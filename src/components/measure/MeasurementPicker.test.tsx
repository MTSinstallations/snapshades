import { fireEvent, render, screen } from "@testing-library/react";
import MeasurementPicker from "./MeasurementPicker";

describe("MeasurementPicker", () => {
  it("renders all whole inches in the range", () => {
    render(<MeasurementPicker value={null} onChange={() => {}} min={10} max={14} />);
    for (const n of [10, 11, 12, 13, 14]) {
      expect(screen.getByRole("button", { name: String(n) })).toBeInTheDocument();
    }
  });

  it("displays the live value with fraction", () => {
    render(<MeasurementPicker value={54.75} onChange={() => {}} />);
    expect(screen.getByText("54 ¾")).toBeInTheDocument();
  });

  it("emits whole + existing fraction when a whole inch is tapped", () => {
    const onChange = vi.fn();
    render(<MeasurementPicker value={12.5} onChange={onChange} min={10} max={20} />);
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    expect(onChange).toHaveBeenCalledWith(15.5);
  });

  it("emits whole + new fraction when a fraction chip is tapped", () => {
    const onChange = vi.fn();
    render(<MeasurementPicker value={20} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "¼" }));
    expect(onChange).toHaveBeenCalledWith(20.25);
  });

  it("disables fraction chips until a whole is selected", () => {
    render(<MeasurementPicker value={null} onChange={() => {}} />);
    const half = screen.getByRole("button", { name: "½" });
    expect(half).toBeDisabled();
  });

  it("clear button resets to zero", () => {
    const onChange = vi.fn();
    render(<MeasurementPicker value={36.5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
