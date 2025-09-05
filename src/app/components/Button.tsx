import { cx } from "lib/cx";
import { Tooltip } from "components/Tooltip";

type ReactButtonProps = React.ComponentProps<"button">;
type ReactAnchorProps = React.ComponentProps<"a">;
type ButtonProps = ReactButtonProps | ReactAnchorProps;

const isAnchor = (props: ButtonProps): props is ReactAnchorProps => {
  return "href" in props;
};

export const Button = (props: ButtonProps) => {
  if (isAnchor(props)) {
    return <a {...props} />;
  } else {
    return <button type="button" {...props} />;
  }
};

export const PrimaryButton = ({ className, ...props }: ButtonProps) => (
  <Button 
    className={cx(
      "bg-black text-white border border-black hover:bg-gray-800 transition-all duration-300", 
      className
    )} 
    {...props} 
  />
);

type IconButtonProps = ButtonProps & {
  size?: "small" | "medium";
  tooltipText: string;
};

export const IconButton = ({
  className,
  size = "medium",
  tooltipText,
  ...props
}: IconButtonProps) => (
  <Tooltip text={tooltipText}>
    <Button
      type="button"
      className={cx(
        "rounded-none outline-none hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white transition-all duration-200 border border-transparent hover:border-black",
        size === "medium" ? "p-2" : "p-1.5",
        className
      )}
      {...props}
    />
  </Tooltip>
);
