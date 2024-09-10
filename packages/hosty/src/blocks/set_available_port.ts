import path from 'path'
import { block } from './block.js'
import { builtin } from '../ansible/tasks/index.js'
import { create_directory } from './create_directory.js'

export function set_available_ports(service_dir: string, count: number, var_name: string) {
  const port_file = path.join(service_dir, '.ports')
  const cmd = `
    # Initialize variables
    ports=()
    existing_ports=()
    count=0
    desired_count=${count}

    # Read existing ports from the file, if it exists
    if [ -f "${port_file}" ]; then
        while IFS= read -r line; do
            existing_ports+=("$line")
        done < "${port_file}"
    fi

    # Add existing ports to the final list
    for port in "\${existing_ports[@]}"; do
        ports+=("$port")
        count=$((count + 1))
        [ $count -eq $desired_count ] && break
    done

    # If we still need more ports, find and add available ones
    if [ $count -lt $desired_count ]; then
        for port in $(seq 8000 9000); do
            # Skip ports already in the list
            if [[ " \${ports[*]} " == *" $port "* ]]; then
                continue
            fi
            (echo >/dev/tcp/localhost/$port) &>/dev/null && continue || ports+=($port)
            count=$((count + 1))
            [ $count -eq $desired_count ] && break
        done
    fi

    # If we have too many ports, trim the list
    if [ $count -gt $desired_count ]; then
        ports=("\${ports[@]:0:$desired_count}")
    fi

    # Write the ports to the file, one per line
    > "${port_file}"  # Clear the file before writing
    for port in "\${ports[@]}"; do
        echo "$port" >> "${port_file}"
    done
  `
  return block(`Generate ${count} available ports for ${service_dir} into the var ${var_name}`, {}, [
    create_directory(service_dir),
    builtin.shell(`Generate an available port in ${port_file}`, { cmd, executable: '/bin/bash' }),
    builtin.command(`Read the ports from ${port_file}`, { cmd: `cat ${port_file}` }, { register: 'cat_ports' }),
    builtin.set_facts(`Set the ports in the var ${var_name}`, { [var_name]: `{{cat_ports.stdout_lines}}` }),
  ]).get()
}
