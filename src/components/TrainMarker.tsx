interface TrainMarkerProps {
  number: string;
  speed: string;
  longitude: number;
  latitude: number;
}

import styles from "./TrainMarker.module.css";

export const TrainMarker: React.FC<TrainMarkerProps> = ({
  number,
  speed,
  longitude,
  latitude,
}) => {
  return (
    <div className={styles["train-marker"]}>
      <div className={styles["train-icon"]} />
      <div className={styles["train-info"]}>
        <span className={styles["train-number"]}>{number}</span>
      </div>
    </div>
  );
};
