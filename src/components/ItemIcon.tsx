interface ItemIconProps {
  namespace: string;
  size: number;
}

/** An item's picture. It is decorative: the item's name is always shown beside it. */
export function ItemIcon({ namespace, size }: ItemIconProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/${namespace}.gif`}
      alt=""
      className="item-icon"
      width={size}
      height={size}
      loading="lazy"
    />
  );
}
