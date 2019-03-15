local pipeline(version) = {
    kind: "pipeline",
    name: "node-v" + version,
    steps: [
        {
            name: "tests",
            image: "node:" + version,
            commands: [
                "yarn 2> /dev/null",
                "yarn test"
            ],
            environment: {
              NODE_ENV: "test",
            },
        },
    ],
    trigger: {
      event: "push"
    },
};

[
    pipeline("4"),
    pipeline("6"),
    pipeline("8"),
    pipeline("9"),
    pipeline("10"),
    pipeline("11"),
]