#!/bin/bash

# Variables
ip="xxx.xxx.xxx.xxx"
hostname="xxx"
username="xxx"
password="xxx"
local_public_key_path="$HOME/.ssh/id_rsa.pub"

# Add the line '$ip $hostname' to /etc/hosts if not already exists
if ! grep -qxF "$ip $hostname" /etc/hosts; then
  echo "$ip $hostname" | sudo tee -a /etc/hosts > /dev/null
  echo "Added $hostname to /etc/hosts"
fi

# SSH into the VPS and execute the following commands
ssh root@$hostname <<EOF
  # Create a new user with the specified username and password
  useradd -m -s /bin/bash -G sudo $username
  echo "$username:$password" | chpasswd
  echo "User $username created and added to sudo group"

  # Generate SSH key for the user
  su - $username -c "mkdir -p /home/$username/.ssh && ssh-keygen -t rsa -b 2048 -f /home/$username/.ssh/id_rsa -q -N ''"
  echo "SSH key generated for $username"

  # Add local public key to the authorized_keys of the new user
  su - $username -c "echo '$(cat $local_public_key_path)' >> /home/$username/.ssh/authorized_keys"
  su - $username -c "chmod 600 /home/$username/.ssh/authorized_keys"
  echo "Local public key added to $username's authorized_keys"

  # Configure UFW to allow only SSH, HTTP, and HTTPS
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
  echo "UFW configured to allow only SSH, HTTP, and HTTPS"
EOF

echo "Server setup done."
