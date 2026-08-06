-- Full Linux Fundamentals curriculum for AfroKernel
-- Run in Supabase SQL Editor (Dashboard → SQL)

-- Ensure the published linux course exists
DO $$
DECLARE
  cid UUID;
BEGIN
  SELECT id INTO cid FROM public.courses WHERE slug = 'linux' LIMIT 1;

  IF cid IS NULL THEN
    INSERT INTO public.courses (title, slug, description, category, difficulty, published, sort_order)
    VALUES (
      'Linux Fundamentals',
      'linux',
      'A complete beginner-to-intermediate path: terminal basics, files, users, packages, services, and networking.',
      'Fundamentals',
      'beginner',
      true,
      1
    )
    RETURNING id INTO cid;
  ELSE
    UPDATE public.courses SET
      title = 'Linux Fundamentals',
      description = 'A complete beginner-to-intermediate path: terminal basics, files, users, packages, services, and networking.',
      category = 'Fundamentals',
      difficulty = 'beginner',
      published = true
    WHERE id = cid;
  END IF;

  -- Clear old single stub lesson(s) with slug linux / empty path
  DELETE FROM public.lessons WHERE course_id = cid;

  INSERT INTO public.lessons (course_id, slug, title, lesson_type, content, video_url, xp_reward, sort_order, published) VALUES
  (
    cid, '01-welcome-to-linux', '1. Welcome to Linux', 'notes',
    E'# Welcome to Linux\n\nLinux powers servers, cloud, phones, and DevOps tools worldwide.\n\n## What you will learn\n- Using the terminal confidently\n- Files, folders, and permissions\n- Users and packages\n- Services with systemd\n- Basic networking\n\n## Try this\nOpen the **Lab** and run:\n\n```bash\nuname -a\nwhoami\npwd\n```\n\nThen mark this lesson complete and continue.',
    NULL, 15, 1, true
  ),
  (
    cid, '02-terminal-basics', '2. Terminal Basics', 'notes',
    E'# Terminal Basics\n\nThe shell is how admins talk to Linux.\n\n## Essential commands\n| Command | Meaning |\n|---------|---------|\n| `pwd` | Print working directory |\n| `ls -la` | List files (detailed) |\n| `cd /path` | Change directory |\n| `clear` | Clear the screen |\n| `history` | Show past commands |\n\n## Practice in the Lab\n```bash\npwd\nls -la\ncd /home/learner\necho \"Hello AfroKernel\"\n```\n\n## Tip\nUse `Tab` to autocomplete paths (in a real terminal).',
    'https://www.youtube.com/watch?v=ROjZy1WbCIA', 20, 2, true
  ),
  (
    cid, '03-files-and-folders', '3. Files & Folders', 'notes',
    E'# Files and Folders\n\nEverything in Linux is a file — including devices.\n\n## Create and manage\n```bash\nmkdir -p /home/learner/projects/demo\ncd /home/learner/projects/demo\ntouch notes.txt\necho \"day 1\" > notes.txt\ncat notes.txt\ncp notes.txt notes.bak\nmv notes.bak archive.txt\nrm archive.txt\n```\n\n## Important paths\n- `/home/learner` — your home\n- `/etc` — configuration\n- `/var/log` — logs\n- `/mnt/c` — mounted disk (in AfroKernel Lab)\n\n## Practice\nCreate a folder on the virtual disk and list it with `tree` or `ls -R`.',
    NULL, 20, 3, true
  ),
  (
    cid, '04-users-and-permissions', '4. Users & Permissions', 'notes',
    E'# Users and Permissions\n\nSecurity starts with who can do what.\n\n## Users\n```bash\nwhoami\nid\ncat /etc/passwd\nuseradd -m alice\npasswd alice\n```\n\n## Permissions (chmod)\n```bash\nchmod 755 script.sh\nchmod u+x script.sh\nls -l\n```\n\n## Ownership\n```bash\nchown learner:learner file.txt\n```\n\n## Practice in Lab\nCreate a user `student`, give them a home directory, and verify with `cat /etc/passwd`.',
    NULL, 25, 4, true
  ),
  (
    cid, '05-packages', '5. Package Management', 'notes',
    E'# Package Management\n\nInstall software the admin way.\n\n## Debian / Ubuntu (apt)\n```bash\napt update\napt install nginx\napt list\nwhich nginx\n```\n\n## Alpine (apk)\n```bash\napk add curl\n```\n\n## RHEL-style (yum/dnf)\n```bash\nyum install vim\n```\n\n## Practice\nIn the Lab, install `nginx` and `htop`, then confirm with `which` and `dpkg -l`.',
    NULL, 25, 5, true
  ),
  (
    cid, '06-systemd-services', '6. Services with systemd', 'notes',
    E'# systemd Services\n\nModern Linux uses systemd to start and supervise services.\n\n## Common actions\n```bash\nsystemctl status nginx\nsystemctl start nginx\nsystemctl stop nginx\nsystemctl restart nginx\nsystemctl enable nginx\n```\n\n## Logs\n```bash\njournalctl\n```\n\n## Practice\nCheck nginx status, restart it, then read recent logs.',
    NULL, 25, 6, true
  ),
  (
    cid, '07-networking', '7. Networking Basics', 'notes',
    E'# Networking Basics\n\nEvery sysadmin needs to read interfaces and test connectivity.\n\n## Commands\n```bash\nip addr\nping 8.8.8.8\ncurl https://afrokernel.dev\nss\ndf -h\n```\n\n## Practice\nShow your Lab IP, ping Google DNS, and fetch a page with curl.',
    NULL, 20, 7, true
  ),
  (
    cid, '08-course-capstone', '8. Capstone Challenge', 'notes',
    E'# Capstone Challenge\n\nPut it all together in the AfroKernel Lab:\n\n1. `mkdir -p /opt/afrokernel/app`\n2. `useradd -m deploy`\n3. `apt install nginx`\n4. `systemctl status nginx`\n5. `echo \"ready\" > /opt/afrokernel/app/STATUS.txt`\n6. `cat /opt/afrokernel/app/STATUS.txt`\n\n## Next steps\n- Take the **Practice Quiz**\n- Ask the **AI Tutor** to review your commands\n- Explore more courses and the Docs library\n\nCongratulations — you finished Linux Fundamentals!',
    NULL, 40, 8, true
  );
END $$;
