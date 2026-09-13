import chalk from "chalk";

export const logger = {
  info(message: string) {
    console.log(chalk.blue("[INFO]"), message);
  },

  success(message: string) {
    console.log(chalk.green("[DONE]"), message);
  },

  error(message: string) {
    console.log(chalk.red("[ERROR]"), message);
  },
};
